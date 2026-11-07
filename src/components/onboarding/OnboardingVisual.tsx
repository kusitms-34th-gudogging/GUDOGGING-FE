import {
  Canvas,
  createPicture,
  Group,
  Picture,
  type SkCanvas,
  Skia,
  TileMode,
} from '@shopify/react-native-skia';
import { colors } from '@tokens';
import { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  type SharedValue,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

// 노션 "온보딩 인터랙션" 값. 캔버스는 375 × 436 기준이고 기기 폭에 맞춰 비율 스케일
const W = 375;
const H = 436;
const CX = 187.5;
const CY = 225;
const SPACING = 25;
const RM = 118;
const NEVER = 1e9;

const BREATH_SEC = 4;
const INHALE_SEC = 1.6;
const EMIT_PER_CYCLE = 34; // 초당 14개 × 2.4초
const EMIT_SEC = BREATH_SEC - INHALE_SEC;
const DECAY = -Math.log(0.85); // 초당 15% 감속
const EMIT_DIR = (-42 * Math.PI) / 180;
const MAX_FRAME_MS = 50;
const MAX_SOURCE_TRIES = 12;
const RETURN_R = 104 * 0.7; // O-02로 넘어갈 때 점이 돌아오는 반지름 (원 반지름 70%)

// 하프톤 점 배치: 동심원, 홀수 줄은 반 칸 엇갈림
const fieldX: number[] = [];
const fieldY: number[] = [];
for (let r = 0, i = 0; r <= RM + 12; r += SPACING, i++) {
  const n = r ? Math.round((2 * Math.PI * r) / SPACING) : 1;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * 2 * Math.PI + ((i % 2) * Math.PI) / n;
    fieldX.push(Math.cos(a) * r);
    fieldY.push(Math.sin(a) * r);
  }
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const RED_100 = rgb(colors.red[100]);
const RED_200 = rgb(colors.red[200]);
const RED_300 = rgb(colors.red[300]);
const RED_400 = rgb(colors.red[400]);
const RED_500 = rgb(colors.red[500]);
const WHITE = [1, 1, 1];

const color = (c: number[], alpha: number) => {
  'worklet';
  return Float32Array.of(c[0], c[1], c[2], alpha);
};

const rand = (seed: number) => {
  'worklet';
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

const smoothstep = (x: number) => {
  'worklet';
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

// 3잎 장미 곡선. t=0이면 가운데(동작 줄이기의 정지 프레임)
const coreAt = (t: number) => {
  'worklet';
  const th = t * 0.55;
  const r = 92 * Math.sin(3 * th);
  return { x: CX + r * Math.cos(th), y: CY + r * Math.sin(th) };
};

// Core 가장자리(거리 58)에서 최대
const ringAt = (px: number, py: number, core: { x: number; y: number }) => {
  'worklet';
  const d = Math.hypot(px - core.x, py - core.y);
  return Math.exp(-(((d - 58) / 30) ** 2));
};

const breathScale = (t: number) => {
  'worklet';
  const p = t % BREATH_SEC;
  return p < INHALE_SEC
    ? 0.97 + 0.06 * smoothstep(p / INHALE_SEC)
    : 1.03 - 0.06 * smoothstep((p - INHALE_SEC) / EMIT_SEC);
};

const drawGlow = (
  canvas: SkCanvas,
  x: number,
  y: number,
  r: number,
  c: number[],
  alpha: number,
) => {
  'worklet';
  if (alpha <= 0) return;
  const paint = Skia.Paint();
  paint.setShader(
    Skia.Shader.MakeRadialGradient(
      { x, y },
      r,
      [color(c, alpha), color(c, alpha * 0.55), color(c, 0)],
      [0, 0.55, 1],
      TileMode.Clamp,
    ),
  );
  canvas.drawCircle(x, y, r, paint);
};

const drawDot = (
  canvas: SkCanvas,
  paint: ReturnType<typeof Skia.Paint>,
  x: number,
  y: number,
  r: number,
  c: number[],
  alpha: number,
) => {
  'worklet';
  paint.setColor(color(c, alpha));
  canvas.drawCircle(x, y, r, paint);
};

const mix = (a: number[], b: number[], u: number) => {
  'worklet';
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
};

// 방출 점은 상태를 들고 있지 않고 (숨 주기, 번호)로 위치를 계산함 → 프레임마다 같은 결과
// O-02로 넘어가면(emitUntil이 정해지면) 그 시점의 위치·나이에서 멈춘 채 반지름 70%로 돌아오며 사라짐
const drawEmitted = (
  canvas: SkCanvas,
  paint: ReturnType<typeof Skia.Paint>,
  t: number,
  e: number,
  emitFrom: number,
  emitUntil: number,
) => {
  'worklet';
  const frozen = emitUntil < NEVER;
  const k0 = Math.floor(t / BREATH_SEC);
  for (let k = Math.max(0, k0 - 1); k <= k0; k++) {
    for (let j = 0; j < EMIT_PER_CYCLE; j++) {
      const ts = k * BREATH_SEC + INHALE_SEC + (j * EMIT_SEC) / EMIT_PER_CYCLE;
      if (ts > t) break;
      if (ts < emitFrom || ts >= emitUntil) continue;
      const seed = k * 100 + j + 1;
      const life = 1.8 + rand(seed * 1.7);
      const age = frozen ? Math.min(t, emitUntil) - ts : t - ts;
      if (age >= life) continue;

      // 우상단 쪽이면서 Core 가장자리에서 크게 보이던 점에서 새어 나감
      const core = coreAt(ts);
      const start = Math.floor(rand(seed * 3.1) * fieldX.length);
      let src = -1;
      let size = 0;
      for (let q = 0; q < MAX_SOURCE_TRIES; q++) {
        const i = (start + q * 7) % fieldX.length;
        const rho = Math.hypot(fieldX[i], fieldY[i]);
        if (!rho) continue;
        const along = (fieldX[i] * Math.cos(EMIT_DIR) + fieldY[i] * Math.sin(EMIT_DIR)) / rho;
        const ring = ringAt(CX + fieldX[i], CY + fieldY[i], core);
        const d = 11 * ring * smoothstep((RM - rho) / 34);
        if (along > 0.3 && ring > 0.45 && d > 3) {
          src = i;
          size = d;
          break;
        }
      }
      if (src < 0) continue;

      const dir = EMIT_DIR + (rand(seed * 5.3) - 0.5) * 0.7;
      const speed = 28 + 32 * rand(seed * 7.7);
      const dist = (speed * (1 - 0.85 ** age)) / DECAY;
      let x = CX + fieldX[src] + Math.cos(dir) * dist;
      let y = CY + fieldY[src] + Math.sin(dir) * dist;

      const u = age / life;
      let c = u < 0.45 ? mix(WHITE, RED_300, u / 0.45) : mix(RED_300, RED_200, (u - 0.45) / 0.55);
      let alpha = u < 0.1 ? u / 0.1 : 1 - ((u - 0.1) / 0.9) ** 1.4;
      let r = size * 0.5 * (1 - 0.5 * u);

      if (e > 0) {
        if (e >= 1) continue;
        const a = Math.atan2(y - CY, x - CX);
        x += (CX + Math.cos(a) * RETURN_R - x) * e;
        y += (CY + Math.sin(a) * RETURN_R - y) * e;
        c =
          u * (1 - e) < 0.45
            ? mix(WHITE, RED_300, (u * (1 - e)) / 0.45)
            : mix(RED_300, RED_200, (u * (1 - e) - 0.45) / 0.55);
        alpha = (1 - e) * 0.9 + 0.1;
        r = size * 0.5;
      }
      drawDot(canvas, paint, x, y, Math.max(0.6, r), c, alpha);
    }
  }
};

const drawVisual = (
  canvas: SkCanvas,
  t: number,
  step: number,
  emitFrom: number,
  emitUntil: number,
) => {
  'worklet';
  const e = smoothstep(step); // 점 복귀 0.8초 easeInOut
  const tail = Math.exp(-6 * Math.min(1, (step * 0.8) / 0.4)); // 우상단 꼬리 0.4초 지수 감쇠
  const core = coreAt(t);
  const s = breathScale(t);

  canvas.save();
  canvas.translate(CX, CY);
  canvas.scale(s, s);
  canvas.translate(-CX, -CY);

  // Haze: 가장 옅은 덩어리는 제자리에서 흔들리고, 중간 덩어리는 Core 쪽으로 40% 따라감
  drawGlow(canvas, CX + 14 * Math.sin(t / 5), CY + 12 * Math.sin(t / 6), 200, RED_100, 1);
  drawGlow(canvas, CX + (core.x - CX) * 0.4, CY + (core.y - CY) * 0.4, 150, RED_200, 0.9);
  // O-01 우상단 꼬리: 비스듬히 누운 타원
  if (tail > 0.005) {
    canvas.save();
    canvas.translate(CX + Math.cos(EMIT_DIR) * 110, CY + Math.sin(EMIT_DIR) * 110);
    canvas.rotate((EMIT_DIR * 180) / Math.PI, 0, 0);
    canvas.scale(1.9, 0.75);
    drawGlow(canvas, 0, 0, 80, RED_100, 0.9 * tail);
    drawGlow(canvas, 0, 0, 50, RED_200, 0.5 * tail);
    canvas.restore();
  }
  drawGlow(canvas, core.x, core.y, 96, RED_400, 0.95);
  drawGlow(canvas, core.x, core.y, 56, RED_500, 0.55);

  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  for (let i = 0; i < fieldX.length; i++) {
    const rho = Math.hypot(fieldX[i], fieldY[i]);
    const ring = ringAt(CX + fieldX[i], CY + fieldY[i], core);
    const d = 11 * ring * smoothstep((RM - rho) / 34);
    if (d < 1.5) continue;
    drawDot(canvas, paint, CX + fieldX[i], CY + fieldY[i], d / 2, WHITE, 0.35 + 0.65 * ring);
  }
  drawEmitted(canvas, paint, t, e, emitFrom, emitUntil);

  canvas.restore();
};

interface OnboardingVisualProps {
  /** 현재 페이지. 2로 가면 방출이 멈추고 점이 돌아옴 */
  page: 1 | 2;
  /** 0(O-01) ~ 1(O-02). 점 복귀·꼬리 사라짐을 이 값 하나로 만듦 */
  step: SharedValue<number>;
}

export const OnboardingVisual = ({ page, step }: OnboardingVisualProps) => {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  const emitFrom = useSharedValue(reduceMotion ? NEVER : 0);
  const emitUntil = useSharedValue(NEVER);
  const prevPage = useRef(page);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (reduceMotion) return;
    t.value += Math.min(timeSincePreviousFrame ?? 0, MAX_FRAME_MS) / 1000;
  });

  // 방출은 현재 시점 기준으로 끊고 이어 붙임: 뒤로 가면 다음 날숨부터 다시 시작
  useEffect(() => {
    if (reduceMotion || prevPage.current === page) return;
    if (page === 2) {
      emitUntil.value = t.value;
    } else {
      emitFrom.value = t.value;
      emitUntil.value = NEVER;
    }
    prevPage.current = page;
  }, [page, reduceMotion, t, emitFrom, emitUntil]);

  const picture = useDerivedValue(() =>
    createPicture(
      (canvas) => drawVisual(canvas, t.value, step.value, emitFrom.value, emitUntil.value),
      { width: W, height: H },
    ),
  );
  const scale = useDerivedValue(() => [{ scale: width / W }]);

  return (
    <Canvas
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      className="aspect-[375/436] w-full"
    >
      <Group transform={scale}>
        <Picture picture={picture} />
      </Group>
    </Canvas>
  );
};
