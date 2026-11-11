import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { CheckIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  // 높이 24 고정 + 가운데 정렬. 위아래 패딩(4)을 넣으면 Line의 1px 테두리만큼 글자 자리가 줄어 아래로 밀림
  'h-s24 flex-row items-center justify-center gap-inline-xs rounded-sm px-inset-xs',
  {
    variants: {
      variant: {
        primary: 'bg-bg-brand',
        tonal: 'bg-bg-brand-subtle',
        mono: 'bg-bg-subtle',
        line: 'border-default border-border-default',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

// 아이콘은 글자와 같은 색 (Figma 설명)
const badgeContentVariants = cva('', {
  variants: {
    variant: {
      primary: 'text-text-on-brand',
      tonal: 'text-text-brand',
      mono: 'text-text-secondary',
      line: 'text-text-secondary',
    },
  },
  defaultVariants: { variant: 'primary' },
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  label: string;
  iconLeft?: ComponentType<SvgProps>;
  showIconLeft?: boolean;
  iconRight?: ComponentType<SvgProps>;
  showIconRight?: boolean;
  className?: string;
}

export const Badge = ({
  variant,
  label,
  iconLeft: IconLeft = CheckIcon,
  showIconLeft = false,
  iconRight: IconRight = CheckIcon,
  showIconRight = false,
  className,
}: BadgeProps) => {
  const contentColor = badgeContentVariants({ variant });

  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      {showIconLeft && <IconLeft className={cn('size-icon-xs', contentColor)} />}
      <Text numberOfLines={1} className={cn('shrink text-caption2-semibold', contentColor)}>
        {label}
      </Text>
      {showIconRight && <IconRight className={cn('size-icon-xs', contentColor)} />}
    </View>
  );
};
