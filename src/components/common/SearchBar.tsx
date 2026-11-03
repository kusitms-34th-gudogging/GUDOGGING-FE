import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { CloseIcon, SearchIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

const searchBarVariants = cva(
  'h-[48px] min-w-[200px] flex-row items-center gap-inline-sm rounded-input px-inset-md',
  {
    variants: {
      variant: {
        filled: 'bg-bg-subtle',
        elevated: 'bg-surface-raised shadow-elevation-2',
      },
    },
    defaultVariants: { variant: 'filled' },
  },
);

interface SearchBarProps
  extends
    Omit<TextInputProps, 'className' | 'placeholderTextColor' | 'value' | 'onChangeText'>,
    VariantProps<typeof searchBarVariants> {
  value: string;
  onChangeText: (text: string) => void;
  icon?: ComponentType<SvgProps>;
  className?: string;
}

export const SearchBar = ({
  variant,
  icon: Icon = SearchIcon,
  className,
  value,
  onChangeText,
  ...inputProps
}: SearchBarProps) => (
  <View className={cn(searchBarVariants({ variant }), className)}>
    <Icon className="size-icon-sm text-icon-secondary" />
    <TextInput
      {...inputProps}
      value={value}
      onChangeText={onChangeText}
      returnKeyType="search"
      placeholderClassName="text-text-tertiary"
      // iOS TextInput은 lineHeight 주면 글자가 아래로 쏠림 → iOS만 0(=미지정)으로 덮어씀 (TextField와 동일)
      className="ios:!leading-[0px] flex-1 text-text-primary text-body1-regular"
    />
    {!!value && (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="검색어 지우기"
        hitSlop={12}
        onPress={() => onChangeText('')}
        className="size-icon-sm items-center justify-center rounded-full bg-icon-disabled"
      >
        <CloseIcon className="size-[12px] text-icon-inverse" />
      </Pressable>
    )}
  </View>
);
