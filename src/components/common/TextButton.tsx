import { Pressable, Text } from 'react-native';

import { ChevronRightIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

interface TextButtonProps {
  label: string;
  showChevron?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

export const TextButton = ({
  label,
  showChevron = true,
  disabled,
  onPress,
  className,
}: TextButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    className={cn(
      'h-touch-target min-w-touch-target max-w-[200px] flex-row items-center justify-center gap-inline-xs rounded-button px-inset-xs active:bg-action-ghost-pressed',
      className,
    )}
  >
    <Text
      numberOfLines={1}
      className={cn(
        'shrink text-body2-semibold',
        disabled ? 'text-text-disabled' : 'text-text-secondary',
      )}
    >
      {label}
    </Text>
    {showChevron && (
      <ChevronRightIcon
        className={cn('size-icon-xs', disabled ? 'text-text-disabled' : 'text-icon-secondary')}
      />
    )}
  </Pressable>
);
