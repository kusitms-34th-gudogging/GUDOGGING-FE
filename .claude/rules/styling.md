---
paths:
  - 'src/**/*.tsx'
---

# 스타일링 규칙 (NativeWind v4)

- 스타일은 `className`의 Tailwind 클래스만. `StyleSheet.create`·별도 스타일 파일 만들지 않음
- 인라인 `style={{ ... }}` 금지
  - 예외: Reanimated `useAnimatedStyle` 결과는 Animated 컴포넌트의 `style`로 넘김
- 조건부·가변 클래스는 `cn` (`@/utils/cn`, clsx만 사용). 템플릿 문자열로 이어붙이지 않음
- clsx는 충돌 클래스를 정리 안 함 → 한 요소에 같은 속성 클래스(`p-s16` + `p-s8`) 겹쳐 쓰지 않기

```tsx
// ✅
<View className={cn('rounded-card p-s16', isActive && 'bg-action-primary', className)} />
// ❌
<View className={`rounded-card p-s16 ${isActive ? 'bg-action-primary' : ''} ${className}`} />
```

## 디자인 토큰 (매핑표: `.claude/docs/design-tokens.md`)

- 색·간격·radius·크기는 토큰 클래스 우선. 토큰 → Tailwind 기본 스케일 → arbitrary value(`w-[123px]`) 순. arbitrary가 반복되면 토큰 등록 요청
- primary spacing은 `s` 접두사: `p-s16`, `gap-s8` (`p-4` 같은 기본 스케일과 구분)
- 색은 semantic 우선: `text-text-primary`, `bg-bg-default`, `bg-action-primary`, `border-border-default`, `text-icon-secondary`
- `asset`·`category`와 violet·fuchsia·orange·green·blue·yellow는 의도적으로 토큰에서 제외한 그래픽 전용 색. 쓰려면 Figma hex로 arbitrary value(`text-[#3F7FEF]`)
- 텍스트는 `text-{typography}` 필수 (`text-body1-regular`). 클래스 없는 `<Text>`는 Pretendard가 아닌 시스템 폰트
- 아이콘·버튼 크기는 size 토큰: `size-icon-md`, `h-button-lg`
- motion·gradient·grid는 className 불가 → `import { motion, gradient, grid } from '@tokens'`. gradient `start`/`end`는 직접 지정

## 플랫폼별 코드

- 값 몇 개 차이: `Platform.select({ ios, android })`
- 컴포넌트 통째로 다름: `.ios.tsx` / `.android.tsx` 분리, 웹 vs 앱만 다르면 `.native.tsx`
- 확장자 없는 기본 파일 항상 존재 + 플랫폼 파일끼리 props 동일. import는 확장자 없이
