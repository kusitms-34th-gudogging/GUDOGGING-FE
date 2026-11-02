import { Pressable, View } from 'react-native';

import { cn } from '@/utils/cn';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  className?: string;
}

export const Toggle = ({ value, onValueChange, accessibilityLabel, className }: ToggleProps) => (
  <Pressable
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    accessibilityLabel={accessibilityLabel}
    onPress={() => onValueChange(!value)}
    className={cn(
      'h-[31px] w-[51px] rounded-full p-s2',
      value ? 'bg-action-primary' : 'bg-border-default',
      className,
    )}
  >
    <View
      className={cn(
        'size-[27px] rounded-full bg-surface-default shadow-[0_2px_6px_0_rgba(0,0,0,0.15)]',
        value && 'translate-x-[20px]',
      )}
    />
  </Pressable>
);
