# 디자인 토큰 흐름

```txt
Figma (Tokens Studio) ── 디자이너 푸시
   ▼
design-token 브랜치: tokens/default-token.json   ← 원본, 손으로 안 고침
   │ GitHub Actions(design-token.yml): dev 머지 → pnpm tokens:build → 커밋 → dev 대상 PR 생성/갱신
   ▼
tokens/tailwind-token.json                       ← 생성 파일, 손으로 안 고침
   ├─ tailwind.config.js (theme.extend + typography 플러그인) → className
   └─ tokens/index.ts → `@tokens` (motion·gradient·grid)
```

- 빌드: `pnpm tokens:build` (`tokens/sd-tokens-config.mjs`, Style Dictionary v5)
- CI가 `tailwind-token.json`이 빌드 결과와 다르면 실패 → 빌드 설정을 바꿨으면 생성 결과도 같이 커밋
- `design-token` 브랜치는 토큰 업데이트 전용. dev가 갱신되면 `design-token-sync.yml`이 자동 머지
- 토큰 수정은 Figma에서. 코드에서 토큰이 필요하면 디자이너에게 요청

## Figma 경로 → 클래스

`primary`/`semantic`/`styles` 세트를 아래처럼 Tailwind theme 키로 옮긴다 (`sd-tokens-config.mjs`의 `MAPPINGS`).

| Figma 경로                                                  | theme 키                                       | 사용 예                                                                                                              |
| ----------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `primary.spacing.16`                                        | `spacing.s16` (**`s` 접두사**)                 | `p-s16`, `gap-s8`                                                                                                    |
| `semantic.spacing.*`, `primary.layout.*`                    | `spacing.*`                                    | `px-screen-x`, `gap-stack-md`, `h-bottom-cta`, `gap-gutter`                                                          |
| `primary.radius.*`, `semantic.radius.*`                     | `borderRadius` (S/L 라벨은 `sm`/`lg`로)        | `rounded-md`, `rounded-card`, `rounded-button`                                                                       |
| `primary.color.*`, `semantic.color.*`                       | `colors.*`                                     | `text-text-primary`, `bg-bg-default`, `bg-action-primary`, `border-border-default`, `text-icon-brand`, `bg-gray-100` |
| `styles.typography.Display.Bold`                            | `typography.display-bold` (플러그인 유틸)      | `text-display-bold`, `text-body1-regular`                                                                            |
| `primary.size.*`, `semantic.size.*` (펼침)                  | `width`·`height`·`size`·`minWidth`·`minHeight` | `size-icon-md`, `h-button-lg`, `min-h-touch-target`                                                                  |
| `primary.border`, `semantic.border`                         | `borderWidth`                                  | `border-default`, `border-focus`                                                                                     |
| `semantic.opacity`                                          | `opacity`                                      | `opacity-disabled`, `opacity-pressed`                                                                                |
| `styles.shadow.*`                                           | `boxShadow`                                    | `shadow-elevation-1`                                                                                                 |
| `primary/semantic.motion`, `styles.gradient`, `styles.grid` | `@tokens`                                      | `motion.press`, `gradient[100]`, `grid['ios-375-4col']`                                                              |

- 실제 키 목록은 `tokens/tailwind-token.json`에서 확인
- typography는 폰트·크기·행간·자간·굵기를 한 클래스로 지정 (`text-{name}`). 클래스 없는 `<Text>`는 시스템 폰트로 나옴
- `fontSize`(`text-16` 등)·`fontWeight`(`font-bold` 등)도 있지만 텍스트는 typography 클래스 우선

## JS 토큰 (`@tokens`)

className으로 표현할 수 없는 토큰만 `tokens/index.ts`에서 export.

```ts
import { gradient, motion } from '@tokens';

withTiming(1, { duration: motion.press, easing: Easing.bezier(...motion['ease-move']) });
<LinearGradient colors={gradient[100].colors} locations={gradient[100].locations} start={...} end={...} />
```

- duration은 ms 숫자, easing은 bezier 4튜플
- gradient는 `expo-linear-gradient` props 형태 (`{ colors, locations }`). 방향은 토큰에 없어 `start`/`end` 직접 지정

## 빌드 설정 규칙

- radius 키가 Tailwind 방향 유틸(`rounded-t`, `rounded-l`, `rounded-ee` 등)과 겹치면 빌드 실패
- 서로 다른 Figma 경로가 같은 theme 키로 가면 빌드 실패 (키 중복)
- RN 대응 변환: 자간 `%` → px, 그림자 → `box-shadow` 문자열, duration `'150ms'` → `150`
- tailwind-merge 도입 시 토큰 카테고리 추가마다 `extendTailwindMerge` 갱신

## 폰트

- Pretendard Regular/SemiBold/Bold를 `app.json`의 `expo-font` config plugin으로 임베드 (`useFonts` 불필요)
- 네이티브 임베드라 **Expo Go에서는 적용 안 됨** → 개발 빌드(`npx expo run:ios|android`)로 확인
