---
paths:
  - 'src/**/*.tsx'
---

# 스타일링 규칙 (NativeWind v4)

인라인 style·`StyleSheet`·className 템플릿 문자열 금지는 `eslint.config.js`가 강제 (Reanimated `useAnimatedStyle` 결과만 Animated 컴포넌트의 `style`로)

- 조건부·가변 클래스는 `cn` (`@/utils/cn`, clsx만 사용)
- clsx는 충돌 클래스를 정리 안 함 → 한 요소에 같은 속성 클래스(`p-s16` + `p-s8`) 겹쳐 쓰지 않기

```tsx
// ✅
<View className={cn('rounded-card p-s16', isActive && 'bg-action-primary', className)} />
// ❌
<View className={`rounded-card p-s16 ${isActive ? 'bg-action-primary' : ''} ${className}`} />
```

## 바깥 className

- 컴포넌트가 받는 `className`은 레이아웃용만: `mt-*`, `mb-*`, `flex-1`, `self-*`, `w-full`. 색·크기·radius·typography 덮어쓰기 금지 (tailwind-merge 없어서 충돌)
- `className`은 항상 `cn`의 마지막 인자
- 컴포넌트 내부 최상위 요소에 margin 쓰지 않음. 바깥 여백은 사용처가 정함
- 디자인과 다른 모양이 필요하면 `className`으로 우회하지 않고 Figma에 variant 추가 요청

## 디자인 토큰 고르기 (클래스 이름·매핑표: `.claude/docs/design-tokens.md`)

- 토큰 클래스 → Tailwind 기본 스케일 → arbitrary value(`w-[123px]`) 순. arbitrary가 반복되면 토큰 등록 요청
- 색은 semantic 우선 (`text-text-primary`), primary 팔레트(`bg-gray-100`)는 semantic에 없을 때만
- 텍스트는 typography 클래스 필수 (`text-body1-regular`). 클래스 없는 `<Text>`는 Pretendard가 아닌 시스템 폰트
- 아이콘·버튼 크기는 size 토큰 (`size-icon-md`, `h-button-lg`)
- className으로 안 되는 motion(등장·퇴장 애니메이션 등)·gradient·grid는 `@tokens`

## 상태 전환 (transition)

- 상태(`active:`·선택·disabled·포커스)에 따라 색이 바뀌는 요소엔 `transition-colors` (기본 150ms)
- 예외: 선택 표시가 칸 사이를 옮겨 다니는 것은 칸마다 배경을 두지 않고 `useSlidingIndicator`(`src/hooks/useSlidingIndicator.ts`)로 표시 하나를 미끄러뜨림. 칸마다 색 전환하면 두 칸이 동시에 깜빡여 어색함 (참고 코드: `src/components/common/SegmentedControl.tsx`)
- 색이 바뀌는 요소마다 각각 붙임. `Pressable`에만 붙이면 배경만 부드럽고 안쪽 `<Text>` 글자색은 팍 바뀜
- 예외: SVG 아이콘엔 붙이지 않음. 색이 `color` prop으로 넘어가서 transition을 붙이면 엉뚱한 색으로 고정됨
- 예외: TextButton·IconButton(컴포넌트 전체)과 입력 포커스 테두리(TextField·Dropdown)는 붙이지 않음. 늦게 반응하거나 깜빡여 보임
- 조건부 `shadow-*`는 반대쪽에 `shadow-none`. 렌더 도중 그림자가 생기면 에러
- 위치 이동은 `transition-transform` (`value ? 'translate-x-[20px]' : 'translate-x-0'`)
- duration은 Tailwind 기본 스케일 (`duration-200`). 누름 피드백은 기본값 그대로
- transition 클래스는 조건 없이 항상 붙임. 렌더 도중 붙으면 컴포넌트가 다시 마운트됨

## 플랫폼별 코드

- 값 몇 개 차이: `Platform.select({ ios, android })`
- 컴포넌트 통째로 다름: `.ios.tsx` / `.android.tsx` 분리, 웹 vs 앱만 다르면 `.native.tsx`
- 확장자 없는 기본 파일 항상 존재 + 플랫폼 파일끼리 props 동일. import는 확장자 없이

## 이럴 때 더 읽기

- variant(Figma `Type`·`Size` 등)가 있는 컴포넌트를 만들거나 고칠 때 → `.claude/docs/styling/cva.md`
- Figma 변수를 클래스로 옮길 때 → `.claude/docs/design-tokens.md` 매핑표
