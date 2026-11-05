import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, Text } from 'react-native';

import { cn } from '@/utils/cn';

const ctaVariants = cva('', {
  variants: {
    variant: {
      primary: 'bg-action-primary active:bg-action-primary-pressed',
      dark: 'bg-action-inverse active:bg-action-inverse-pressed',
    },
  },
  defaultVariants: { variant: 'primary' },
});

const ctaLabelVariants = cva('', {
  variants: {
    variant: {
      primary: 'text-text-on-brand',
      dark: 'text-text-inverse',
    },
  },
  defaultVariants: { variant: 'primary' },
});

interface CtaProps extends VariantProps<typeof ctaVariants> {
  label: string;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}
export const Cta = ({ variant, label, disabled, onPress, className }: CtaProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    className={cn(
      'h-bottom-cta w-full items-center justify-center rounded-cta px-inset-lg transition-colors',
      disabled ? 'bg-action-disabled' : ctaVariants({ variant }),
      className,
    )}
  >
    <Text
      numberOfLines={1}
      className={cn(
        'text-center transition-colors text-body1-semibold',
        disabled ? 'text-text-on-disabled' : ctaLabelVariants({ variant }),
      )}
    >
      {label}
    </Text>
  </Pressable>
);
