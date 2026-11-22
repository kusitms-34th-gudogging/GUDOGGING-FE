import type { ComponentType } from 'react';
import { Pressable, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { ChevronDownIcon } from '@/assets/icons';
import { Text } from '@/components/common/Text';
import { cn } from '@/utils/cn';

import { DropdownOption } from './DropdownOption';

interface DropdownProps {
  label: string;
  showLabel?: boolean;
  placeholder: string;
  value?: string;
  icon?: ComponentType<SvgProps>;
  showIcon?: boolean;
  open?: boolean;
  onPress: () => void;
  options?: string[];
  onSelect?: (option: string) => void;
  /** 빨간 테두리. helper가 있으면 아래에 빨간 문구
   * shortcut: Figma Dropdown에 에러 variant가 없어 TextField 에러와 같은 모양으로 둠, 디자인 나오면 맞춤 */
  error?: boolean;
  helper?: string;
  className?: string;
  /** 옵션은 `{testID}-option-{순서}` */
  testID?: string;
}

export const Dropdown = ({
  label,
  showLabel = true,
  placeholder,
  value,
  icon: Icon = ChevronDownIcon,
  showIcon = true,
  open = false,
  onPress,
  options,
  onSelect,
  error = false,
  helper,
  className,
  testID,
}: DropdownProps) => (
  <View className={cn('min-w-[120px] gap-stack-sm', open && 'z-10', className)}>
    {showLabel && (
      <Text numberOfLines={1} className="px-s2 text-text-primary text-body3-semibold">
        {label}
      </Text>
    )}
    <View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value ?? placeholder }}
        accessibilityState={{ expanded: open }}
        accessibilityHint={error ? helper : undefined}
        onPress={onPress}
        className={cn(
          // 테두리를 항상 1px로 두고(기본은 투명) 패딩(16)에서 빼서, 열릴 때 글자가 밀리지 않게 함 (TextField와 동일)
          'h-input flex-row items-center gap-inline-sm rounded-input border bg-bg-subtle px-[15px]',
          error && 'border-border-error bg-surface-default',
          !error && (open ? 'border-border-focus' : 'border-transparent'),
        )}
      >
        <Text
          numberOfLines={1}
          className={cn(
            'flex-1 transition-colors text-body2-regular',
            value ? 'text-text-primary' : 'text-text-tertiary',
          )}
        >
          {value ?? placeholder}
        </Text>
        {showIcon && (
          // 열리면 chevron만 위로 뒤집음 (캘린더 등 교체 아이콘은 그대로)
          <View
            className={cn(
              'transition-transform',
              open && Icon === ChevronDownIcon ? 'rotate-180' : 'rotate-0',
            )}
          >
            <Icon className="size-icon-list text-icon-secondary" />
          </View>
        )}
      </Pressable>
      {open && options && (
        <View className="absolute left-0 right-0 top-full mt-s4 rounded-input bg-surface-raised p-inset-xs shadow-elevation-2">
          {options.map((option, i) => (
            <DropdownOption
              key={option}
              testID={testID && `${testID}-option-${i}`}
              label={option}
              selected={option === value}
              onSelect={() => onSelect?.(option)}
            />
          ))}
        </View>
      )}
    </View>
    {error && helper && (
      <Text numberOfLines={2} className="text-text-error text-caption1-regular">
        {helper}
      </Text>
    )}
  </View>
);
