import { colors } from '@tokens';
import { useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/utils/cn';

interface TextFieldProps extends Omit<
  TextInputProps,
  'className' | 'editable' | 'placeholderTextColor'
> {
  label: string;
  // 단위 선택처럼 옆 필드와 라벨을 공유하면 끔 (Figma Text field · Trailing의 Show label)
  showLabel?: boolean;
  // 값 뒤에 붙는 단위 (Figma Text field · Trailing=Text, 예: 원)
  suffix?: string;
  helper?: string;
  showHelper?: boolean;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TextField = ({
  label,
  showLabel = true,
  suffix,
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
      {showLabel && (
        // 높이 20 고정: iOS가 글자 높이를 픽셀 올림해(20→20.33) 라벨마다 아래 요소가 0.33pt씩 밀림. 시스템 큰 글씨에선 잘릴 수 있음
        <Text numberOfLines={1} className="h-[20px] px-s2 text-text-primary text-body3-semibold">
          {label}
        </Text>
      )}
      <View
        className={cn(
          // 테두리를 항상 1px로 두고(기본은 투명) 패딩(16)에서 빼서, 포커스 시 글자가 밀리지 않게 함 (Figma 안쪽 stroke와 동일)
          'h-input flex-row items-center gap-inline-sm rounded-input border px-[15px]',
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
          placeholderTextColor={disabled ? colors.text.disabled : colors.text.tertiary}
          // iOS TextInput은 lineHeight 주면 글자가 아래로 쏠림 (Text와 달리 baseline 보정 없음) → iOS만 0(=미지정)으로 덮어씀
          className={cn(
            'ios:!leading-[0px] flex-1 transition-colors text-body2-regular',
            disabled ? 'text-text-disabled' : 'text-text-primary',
          )}
        />
        {suffix && <Text className="text-text-secondary text-body2-regular">{suffix}</Text>}
      </View>
      {showHelper && helper && (
        <Text
          numberOfLines={2}
          className={cn(
            'transition-colors text-caption1-regular',
            showError ? 'text-text-error' : 'text-text-tertiary',
          )}
        >
          {helper}
        </Text>
      )}
    </View>
  );
};
