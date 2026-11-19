import { colors } from '@tokens';
import { useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '@/components/common/Text';
import { cn } from '@/utils/cn';

interface TextAreaProps extends Omit<
  TextInputProps,
  'className' | 'value' | 'multiline' | 'maxLength' | 'placeholderTextColor'
> {
  value: string;
  maxLength?: number;
  accessibilityLabel: string;
  className?: string;
}

export const TextArea = ({
  value,
  maxLength,
  className,
  onFocus,
  onBlur,
  ...inputProps
}: TextAreaProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn('gap-s4', className)}>
      <TextInput
        allowFontScaling={false} // 시스템 글자 크기 무시 (Text.tsx와 같은 팀 결정)
        {...inputProps}
        value={value}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={colors.text.tertiary}
        // iOS multiline은 기본 위쪽 여백이 붙어서 패딩을 TextInput에 직접 줌. 테두리 1px만큼 패딩(16)에서 뺌 (TextField와 동일)
        className={cn(
          'h-[160px] rounded-input border p-[15px] text-text-primary text-caption1-regular',
          focused && 'border-border-focus',
          !focused && value && 'border-border-strong',
          !focused && !value && 'border-border-default',
        )}
      />
      {maxLength !== undefined && (
        <Text className="px-s2 text-right text-text-disabled text-caption2-regular">
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};
