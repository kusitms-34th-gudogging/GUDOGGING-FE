import { Pressable, View } from 'react-native';

import { CheckIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  locked?: boolean;
  accessibilityLabel: string;
  className?: string;
}

export const Checkbox = ({
  checked,
  onCheckedChange,
  disabled,
  locked,
  accessibilityLabel,
  className,
}: CheckboxProps) => {
  const showCheck = checked && !disabled;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: disabled || locked }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled || locked}
      onPress={() => onCheckedChange(!checked)}
      className={cn('size-touch-target items-center justify-center', className)}
    >
      <View
        className={cn(
          'size-s24 items-center justify-center rounded-sm transition-colors',
          disabled && 'border-default border-border-subtle bg-bg-subtle',
          !disabled && checked && 'bg-action-primary',
          !disabled && !checked && 'border-default border-border-strong bg-surface-default',
        )}
      >
        {showCheck && <CheckIcon className="size-icon-xs text-icon-inverse" />}
      </View>
    </Pressable>
  );
};
