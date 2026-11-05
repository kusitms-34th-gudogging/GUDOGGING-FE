import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { Pressable, Text } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'max-w-[335px] flex-row items-center justify-center gap-inline-xs rounded-button transition-colors',
  {
    variants: {
      size: {
        lg: 'h-button-lg min-w-[88px] px-inset-lg',
        md: 'h-button-md min-w-[72px] px-inset-md',
        sm: 'h-button-sm min-w-[56px] px-inset-md',
      },
    },
    defaultVariants: { size: 'lg' },
  },
);

const buttonBgVariants = cva('', {
  variants: {
    variant: {
      primary: 'bg-action-primary active:bg-action-primary-pressed',
      dark: 'bg-action-inverse active:bg-action-inverse-pressed',
      tonal: 'bg-action-secondary active:bg-action-secondary-pressed',
    },
  },
  defaultVariants: { variant: 'primary' },
});

// 아이콘도 currentColor라 라벨과 같은 색 클래스를 씀
const buttonContentVariants = cva('', {
  variants: {
    variant: {
      primary: 'text-text-on-brand',
      dark: 'text-text-inverse',
      tonal: 'text-text-primary',
    },
  },
  defaultVariants: { variant: 'primary' },
});

const buttonLabelVariants = cva('shrink transition-colors', {
  variants: {
    size: {
      lg: 'text-body1-semibold',
      md: 'text-body2-semibold',
      sm: 'text-body3-semibold',
    },
  },
  defaultVariants: { size: 'lg' },
});

const buttonIconVariants = cva('', {
  variants: {
    size: {
      lg: 'size-icon-sm',
      md: 'size-icon-sm',
      sm: 'size-icon-xs',
    },
  },
  defaultVariants: { size: 'lg' },
});

interface ButtonProps
  extends VariantProps<typeof buttonVariants>, VariantProps<typeof buttonBgVariants> {
  label: string;
  showIcon?: boolean;
  icon?: ComponentType<SvgProps>;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

export const Button = ({
  variant,
  size,
  label,
  showIcon,
  icon: Icon,
  disabled,
  onPress,
  className,
}: ButtonProps) => {
  const contentColor = disabled ? 'text-text-on-disabled' : buttonContentVariants({ variant });

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={cn(
        buttonVariants({ size }),
        disabled ? 'bg-action-disabled' : buttonBgVariants({ variant }),
        className,
      )}
    >
      {showIcon && Icon && <Icon className={cn(buttonIconVariants({ size }), contentColor)} />}
      <Text numberOfLines={1} className={cn(buttonLabelVariants({ size }), contentColor)}>
        {label}
      </Text>
    </Pressable>
  );
};
