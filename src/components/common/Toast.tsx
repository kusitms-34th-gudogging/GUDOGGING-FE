import { cva, type VariantProps } from 'class-variance-authority';
import { Text, View } from 'react-native';

import { AlertCircleIcon, CheckCircleIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

const toastIconVariants = cva('size-icon-sm', {
  variants: {
    type: {
      default: '',
      success: 'text-icon-success',
      error: 'text-icon-inverse',
    },
  },
  defaultVariants: { type: 'default' },
});

const icons = { success: CheckCircleIcon, error: AlertCircleIcon };

export interface ToastProps extends VariantProps<typeof toastIconVariants> {
  message: string;
}

export const Toast = ({ type, message }: ToastProps) => {
  const Icon = type && type !== 'default' ? icons[type] : null;

  return (
    <View
      className={cn(
        // 배경은 Figma에서 변수 없이 #111111 80%
        'min-h-touch-target max-w-[335px] flex-row items-center rounded-toast bg-bg-inverse/80 px-inset-md py-inset-sm shadow-elevation-2',
        Icon ? 'gap-inline-xs' : 'gap-inline-sm',
      )}
    >
      {Icon && <Icon className={toastIconVariants({ type })} />}
      <Text
        numberOfLines={2}
        className={cn(
          'shrink text-text-inverse text-caption1-regular',
          Icon ? 'max-w-[265px]' : 'max-w-[295px]',
        )}
      >
        {message}
      </Text>
    </View>
  );
};
