import type { ComponentType } from 'react';
import { Pressable, Text } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

interface ChipProps {
  label: string;
  icon?: ComponentType<SvgProps>;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

// 높이 36 + hitSlop 4·4 = 누르는 영역 44
export const Chip = ({ label, icon: Icon, selected, onSelect, className }: ChipProps) => {
  const contentColor = selected ? 'text-text-inverse' : 'text-text-primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onSelect}
      hitSlop={{ top: 4, bottom: 4 }}
      className={cn(
        'h-chip min-w-[56px] max-w-[160px] flex-row items-center justify-center gap-inline-xs rounded-button px-inset-sm transition-colors',
        selected ? 'bg-action-inverse' : 'border-default border-border-default bg-surface-default',
        className,
      )}
    >
      <Text
        numberOfLines={1}
        className={cn(
          'shrink transition-colors',
          selected ? 'text-body3-semibold' : 'text-body3-regular',
          contentColor,
        )}
      >
        {label}
      </Text>
      {Icon && <Icon className={cn('size-icon-xs', contentColor)} />}
    </Pressable>
  );
};
