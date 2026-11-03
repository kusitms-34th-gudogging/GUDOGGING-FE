import { View } from 'react-native';

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
}: SegmentedControlProps<T>) => (
  <View
    accessibilityRole="tablist"
    className={cn('flex-row rounded-lg bg-bg-muted p-inset-2xs', className)}
  >
    {options.map((option) => (
      <Segment
        key={option.value}
        label={option.label}
        selected={option.value === selected}
        onSelect={() => onSelect(option.value)}
      />
    ))}
  </View>
);
