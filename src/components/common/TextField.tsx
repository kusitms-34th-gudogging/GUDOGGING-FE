import { useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/utils/cn';

interface TextFieldProps extends Omit<
  TextInputProps,
  'className' | 'editable' | 'placeholderTextColor'
> {
  label: string;
  helper?: string;
  showHelper?: boolean;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TextField = ({
  label,
  helper,
  showHelper,
  error,
  disabled,
  className,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) => {
  const [focused, setFocused] = useState(false);
  const showError = error && !disabled;

  return (
    <View className={cn('min-w-[200px] gap-stack-sm', className)}>
      <Text
        numberOfLines={1}
        className={cn(
          'text-body3-regular',
          disabled ? 'text-text-disabled' : 'text-text-secondary',
        )}
      >
        {label}
      </Text>
      <View
        className={cn(
          // 테두리를 항상 2px로 두고(기본은 투명) 패딩에서 빼서, 포커스 시 글자가 밀리지 않게 함 (Figma 안쪽 stroke와 동일)
          'h-input flex-row items-center gap-inline-sm rounded-input border-focus px-[14px]',
          showError && 'border-border-error bg-surface-default',
          !showError && focused && 'border-border-focus bg-surface-default',
          !showError && !focused && 'border-transparent bg-bg-subtle',
        )}
      >
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          accessibilityHint={showHelper || showError ? helper : undefined}
          editable={!disabled}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderClassName={disabled ? 'text-text-disabled' : 'text-text-tertiary'}
          // iOS TextInput은 lineHeight 주면 글자가 아래로 쏠림 (Text와 달리 baseline 보정 없음) → iOS만 0(=미지정)으로 덮어씀
          className={cn(
            'ios:!leading-[0px] flex-1 text-body1-regular',
            disabled ? 'text-text-disabled' : 'text-text-primary',
          )}
        />
      </View>
      {showHelper && helper && (
        <Text
          numberOfLines={2}
          className={cn(
            'text-caption1-regular',
            showError ? 'text-text-error' : 'text-text-tertiary',
          )}
        >
          {helper}
        </Text>
      )}
    </View>
  );
};
