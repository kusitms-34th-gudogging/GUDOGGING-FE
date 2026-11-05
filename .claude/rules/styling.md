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

## 디자인 토큰 고르기 (클래스 이름·매핑표: `.claude/docs/styling/token-classes.md`)

- 토큰 클래스 → Tailwind 기본 스케일 → arbitrary value(`w-[123px]`) 순. arbitrary가 반복되면 토큰 등록 요청
- 색은 semantic 우선 (`text-text-primary`), primary 팔레트(`bg-gray-100`)는 semantic에 없을 때만
- 텍스트는 typography 클래스 필수 (`text-body1-regular`). 클래스 없는 `<Text>`는 Pretendard가 아닌 시스템 폰트
- 아이콘·버튼 크기는 size 토큰 (`size-icon-md`, `h-button-lg`)
- className으로 안 되는 motion(등장·퇴장 애니메이션 등)·gradient·grid는 `@tokens`

## 플랫폼별 코드

- 값 몇 개 차이: `Platform.select({ ios, android })`
- 컴포넌트 통째로 다름: `.ios.tsx` / `.android.tsx` 분리, 웹 vs 앱만 다르면 `.native.tsx`
- 확장자 없는 기본 파일 항상 존재 + 플랫폼 파일끼리 props 동일. import는 확장자 없이

## 이럴 때 더 읽기

- 누름·선택·disabled·포커스에 따라 색이나 위치가 바뀌는 요소를 만들거나 고칠 때 → `.claude/docs/styling/transition.md`
- variant(Figma `Type`·`Size` 등)가 있는 컴포넌트를 만들거나 고칠 때 → `.claude/docs/styling/cva.md`
- Figma 변수를 클래스로 옮길 때 → `.claude/docs/styling/token-classes.md`
