import { Pressable, Text } from 'react-native';

import { CheckIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

interface DropdownOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

export const DropdownOption = ({ label, selected, onSelect, className }: DropdownOptionProps) => (
  <Pressable
    accessibilityRole="menuitem"
    accessibilityState={{ selected }}
    onPress={onSelect}
    className={cn(
      'h-touch-target flex-row items-center gap-inline-sm rounded-sm px-inset-xs transition-colors',
      selected && 'bg-bg-subtle',
      className,
    )}
  >
    <Text
      numberOfLines={1}
      className={cn(
        'flex-1 text-text-primary',
        selected ? 'text-body2-semibold' : 'text-body2-regular',
      )}
    >
      {label}
    </Text>
    {selected && <CheckIcon className="size-icon-list text-icon-primary" />}
  </Pressable>
);
