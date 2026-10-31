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

## variant 스타일 (cva)

- Figma에 variant property(`Type`, `Size` 등)가 있으면 `cva`(class-variance-authority), 없으면 `cn`만
- tailwind-merge 쓰지 않음 (`cn`은 clsx 그대로)

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, Text } from 'react-native';

import { cn } from '@/utils/cn';

// 클래스는 예시. 실제 값은 Figma 변수 기준
const buttonVariants = cva('items-center justify-center rounded-button', {
  variants: {
    variant: {
      primary: 'bg-action-primary active:bg-action-primary-pressed',
      dark: 'bg-action-inverse active:bg-action-inverse-pressed',
      tonal: 'bg-action-secondary active:bg-action-secondary-pressed',
    },
    size: {
      lg: 'h-button-lg px-s20',
      md: 'h-button-md px-s16',
      sm: 'h-button-sm px-s12',
    },
  },
  defaultVariants: { variant: 'primary', size: 'lg' },
});

const buttonLabelVariants = cva('', {
  variants: {
    variant: {
      primary: 'text-text-on-brand',
      dark: 'text-text-inverse',
      tonal: 'text-text-primary',
    },
    size: { lg: 'text-body1-semibold', md: 'text-body1-semibold', sm: 'text-body2-semibold' },
  },
  defaultVariants: { variant: 'primary', size: 'lg' },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  label: string;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

export const Button = ({ variant, size, label, disabled, onPress, className }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    className={cn(buttonVariants({ variant, size }), disabled && 'opacity-disabled', className)}
  >
    <Text className={buttonLabelVariants({ variant, size })}>{label}</Text>
  </Pressable>
);
```

- cva는 같은 파일 위쪽에 `{name}Variants`로, export 안 함. 요소(컨테이너·라벨 등)마다 하나씩
- variant props 타입은 `VariantProps<typeof xxxVariants>`로 가져옴 (유니온 직접 쓰지 않음)
- 요소별 cva가 여럿이면 variant 추가 시 **모든 cva에 같은 키** 추가 (빠뜨려도 타입 에러 안 남)
- 기본값은 `defaultVariants`에만. props 구조분해 기본값과 중복 금지
- `disabled`·`error`·`selected` 같은 boolean 상태는 cva가 아니라 props + `cn`
- `compoundVariants`는 Figma에서 특정 조합에만 다른 스타일이 확인될 때만

## 바깥 className

- 컴포넌트가 받는 `className`은 레이아웃용만: `mt-*`, `mb-*`, `flex-1`, `self-*`, `w-full`. 색·크기·radius·typography 덮어쓰기 금지 (tailwind-merge 없어서 충돌)
- `className`은 항상 `cn`의 마지막 인자
- 컴포넌트 내부 최상위 요소에 margin 쓰지 않음. 바깥 여백은 사용처가 정함
- 디자인과 다른 모양이 필요하면 `className`으로 우회하지 않고 Figma에 variant 추가 요청

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
