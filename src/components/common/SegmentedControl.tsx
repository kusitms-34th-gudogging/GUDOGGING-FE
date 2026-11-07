import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSlidingIndicator } from '@/hooks/useSlidingIndicator';
import { cn } from '@/utils/cn';

import { Segment } from './Segment';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  className?: string;
}

export const SegmentedControl = <T extends string>({
  options,
  selected,
  onSelect,
  className,
}: SegmentedControlProps<T>) => {
  const { indicatorStyle, onItemLayout, ready } = useSlidingIndicator(
    options.findIndex((option) => option.value === selected),
  );

  return (
    <View
      accessibilityRole="tablist"
      className={cn('flex-row justify-center rounded-lg bg-bg-muted p-inset-2xs', className)}
    >
      {ready && (
        <Animated.View
          pointerEvents="none"
          style={indicatorStyle}
          className="absolute bottom-inset-2xs left-0 top-inset-2xs rounded-button bg-surface-raised shadow-elevation-1"
        />
      )}
      {options.map((option, index) => (
        <Segment
          key={option.value}
          label={option.label}
          selected={option.value === selected}
          onSelect={() => onSelect(option.value)}
          onLayout={onItemLayout(index)}
          className="flex-1"
        />
      ))}
    </View>
  );
};
