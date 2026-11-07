import type { ComponentType } from 'react';
import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

import { Checkbox } from './Checkbox';

interface ListItemIconAction {
  accessibilityLabel: string;
  onPress: () => void;
}

interface ListItemProps {
  title: string;
  subtitle?: string;
  showSubtitle?: boolean;
  cost?: string;
  showCost?: boolean;
  costColor?: string;
  logo?: ImageSourcePropType | ComponentType<SvgProps>;
  showLogo?: boolean;
  iconLeft?: ComponentType<SvgProps>;
  showIconLeft?: boolean;
  iconLeftColor?: string;
  iconRight?: ComponentType<SvgProps>;
  showIconRight?: boolean;
  iconRightColor?: string;
  iconRightAction?: ListItemIconAction;
  showCheckBox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const ListItem = ({
  title,
  subtitle,
  showSubtitle,
  cost,
  showCost,
  costColor = 'text-text-primary',
  logo,
  showLogo,
  iconLeft: IconLeft,
  showIconLeft,
  iconLeftColor = 'text-icon-primary',
  iconRight: IconRight,
  showIconRight,
  iconRightColor = 'text-icon-primary',
  iconRightAction,
  showCheckBox,
  checked = false,
  onCheckedChange,
  className,
}: ListItemProps) => (
  <View
    className={cn(
      'min-w-[280px] flex-row items-center gap-inline-md border-b-default border-border-default px-inline-xs py-inset-sm',
      className,
    )}
  >
    {showLogo && logo && (
      <View className="size-logo-card">
        {typeof logo === 'function' ? (
          <SvgLogo Logo={logo} />
        ) : (
          <Image source={logo} className="size-full" />
        )}
      </View>
    )}
    {showIconLeft && IconLeft && <IconLeft className={cn('size-[28px]', iconLeftColor)} />}
    <View className="flex-1 gap-s2">
      <Text numberOfLines={1} className="text-text-primary text-body3-semibold">
        {title}
      </Text>
      {showSubtitle && subtitle && (
        <Text numberOfLines={1} className="text-text-secondary text-caption1-regular">
          {subtitle}
        </Text>
      )}
    </View>
    <View className="flex-row items-center gap-inline-xs">
      {showCost && cost && (
        <Text numberOfLines={1} className={cn('max-w-[120px] text-body3-semibold', costColor)}>
          {cost}
        </Text>
      )}
      {showCheckBox && (
        // Figma 인스턴스(34×44)에 맞춤: 44 체크박스를 34 틀로 잘라 레이아웃·터치 영역 모두 34×44
        <View className="w-[34px] items-center overflow-hidden">
          <Checkbox
            checked={checked}
            onCheckedChange={(next) => onCheckedChange?.(next)}
            accessibilityLabel={title}
          />
        </View>
      )}
      {showIconRight &&
        IconRight &&
        (iconRightAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={iconRightAction.accessibilityLabel}
            onPress={iconRightAction.onPress}
          >
            <IconRight className={cn('size-icon-list', iconRightColor)} />
          </Pressable>
        ) : (
          <IconRight className={cn('size-icon-list', iconRightColor)} />
        ))}
    </View>
  </View>
);

const SvgLogo = ({ Logo }: { Logo: ComponentType<SvgProps> }) => (
  <Logo width="100%" height="100%" />
);
