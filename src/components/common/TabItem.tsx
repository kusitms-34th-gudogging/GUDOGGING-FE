import type { ComponentType } from 'react';
import { Pressable } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

interface TabItemProps {
  icon: ComponentType<SvgProps>;
  accessibilityLabel: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

// 탭바 안에서는 사용처가 className="flex-1"로 균등 분배
export const TabItem = ({
  icon: Icon,
  accessibilityLabel,
  selected,
  onSelect,
  className,
}: TabItemProps) => (
  <Pressable
    accessibilityRole="tab"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected }}
    onPress={onSelect}
    className={cn(
      'h-nav-bar min-w-[48px] max-w-[140px] items-center justify-center rounded-pill',
      selected && 'bg-bg-muted',
      className,
    )}
  >
    <Icon className="size-icon-md text-icon-primary" />
  </Pressable>
);
