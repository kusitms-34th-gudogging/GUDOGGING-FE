import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { Pressable } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

const iconButtonVariants = cva('items-center justify-center active:opacity-pressed', {
  variants: {
    size: {
      lg: 'size-[56px] rounded-lg',
      md: 'size-touch-target rounded-md',
    },
  },
  defaultVariants: { size: 'lg' },
});

const iconButtonIconVariants = cva('', {
  variants: {
    variant: {
      default: 'text-icon-primary',
      inverse: 'text-icon-inverse',
      brand: 'text-icon-brand',
    },
    size: {
      lg: 'size-[28px]',
      md: 'size-icon-md',
    },
  },
  defaultVariants: { variant: 'default', size: 'lg' },
});

interface IconButtonProps extends VariantProps<typeof iconButtonIconVariants> {
  icon: ComponentType<SvgProps>;
  accessibilityLabel: string;
  onPress?: () => void;
  className?: string;
}

export const IconButton = ({
  variant,
  size,
  icon: Icon,
  accessibilityLabel,
  onPress,
  className,
}: IconButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    className={cn(iconButtonVariants({ size }), className)}
  >
    <Icon className={iconButtonIconVariants({ variant, size })} />
  </Pressable>
);
