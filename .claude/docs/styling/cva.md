# variant 스타일 (cva)

참고 코드: `src/components/common/Button.tsx`

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

## 이럴 때 더 읽기

- Figma property를 props로 옮길 때 → `.claude/docs/components/figma-props.md`
