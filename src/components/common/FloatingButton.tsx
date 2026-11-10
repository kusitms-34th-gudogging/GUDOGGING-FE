import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable } from 'react-native';

import { PlusIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

// 화면 위에 떠 있는 원형 + 버튼 (48, 아이콘 28 → 사방 10)
const floatingButtonVariants = cva(
  'size-s48 items-center justify-center rounded-full active:opacity-pressed',
  {
    variants: {
      variant: {
        // Figma: 배경에 color/icon/brand 변수를 씀
        primary: 'bg-icon-brand',
        tone: 'bg-bg-dim',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

interface FloatingButtonProps extends VariantProps<typeof floatingButtonVariants> {
  accessibilityLabel: string;
  onPress?: () => void;
  className?: string;
}

export const FloatingButton = ({
  variant,
  accessibilityLabel,
  onPress,
  className,
}: FloatingButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    className={cn(floatingButtonVariants({ variant }), className)}
  >
    <PlusIcon className="size-[28px] text-icon-inverse" />
  </Pressable>
);
