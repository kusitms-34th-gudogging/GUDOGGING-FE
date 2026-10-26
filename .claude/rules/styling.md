---
paths:
  - 'src/**/*.tsx'
---

# 스타일링 규칙 (NativeWind v4)

- 스타일은 `className`의 Tailwind 클래스만. `StyleSheet.create`·별도 스타일 파일 만들지 않음
- 인라인 `style={{ ... }}` 금지
  - 예외: Reanimated `useAnimatedStyle` 결과는 Animated 컴포넌트의 `style`로 넘김
- arbitrary value(`w-[123px]`)는 토큰·기본 스케일로 안 될 때만. 반복되면 토큰 등록 요청
- 조건부·가변 클래스는 `cn` (`@/utils/cn`, clsx만 사용). 템플릿 문자열로 이어붙이지 않음
- clsx는 충돌 클래스를 정리 안 함 → 한 요소에 같은 속성 클래스(`p-4` + `p-2`) 겹쳐 쓰지 않기

```tsx
// ✅
<View className={cn('rounded-m p-p4', isActive && 'bg-primary', className)} />
// ❌
<View className={`rounded-m p-p4 ${isActive ? 'bg-primary' : ''} ${className}`} />
```

## 플랫폼별 코드

- 값 몇 개 차이: `Platform.select({ ios, android })`
- 컴포넌트 통째로 다름: `.ios.tsx` / `.android.tsx` 분리, 웹 vs 앱만 다르면 `.native.tsx`
- 확장자 없는 기본 파일 항상 존재 + 플랫폼 파일끼리 props 동일. import는 확장자 없이
