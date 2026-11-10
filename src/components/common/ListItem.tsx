import type { ComponentType, ReactNode } from 'react';
import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

import { Checkbox } from './Checkbox';

// 체크박스가 없으면 행 전체, 있으면 오른쪽 금액·아이콘만 누르는 동작
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
  checkBoxLocked?: boolean;
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
  checkBoxLocked,
  className,
}: ListItemProps) => {
  // 누르는 영역: 체크박스가 없으면 행 전체, 있으면 체크박스와 오른쪽(금액·아이콘)을 따로
  const rowAction = showCheckBox ? undefined : iconRightAction;
  const trailingAction = showCheckBox ? iconRightAction : undefined;

  return (
    <Row action={rowAction} className={className}>
      {(showCheckBox || (showLogo && logo) || (showIconLeft && IconLeft)) && (
        <View className="flex-row items-center gap-stack-xs">
          {(showCheckBox || (showLogo && logo)) && (
            <View className="flex-row items-center gap-s2">
              {showCheckBox && (
                // Figma 인스턴스(34×44, 박스 왼쪽 정렬)에 맞춤: 44 체크박스를 34 틀 오른쪽 끝에 붙여 왼쪽 10을 잘라냄 → 박스가 틀 왼쪽에 오고 터치 영역도 34×44
                <View className="w-[34px] flex-row justify-end overflow-hidden">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => onCheckedChange?.(next)}
                    locked={checkBoxLocked}
                    accessibilityLabel={title}
                  />
                </View>
              )}
              {showLogo && logo && (
                // 흰 로고도 구분되게 border/subtle 1px
                <View className="size-logo-card overflow-hidden rounded-full border-default border-border-subtle">
                  {typeof logo === 'function' ? (
                    <SvgLogo Logo={logo} />
                  ) : (
                    <Image source={logo} className="size-full" />
                  )}
                </View>
              )}
            </View>
          )}
          {showIconLeft && IconLeft && <IconLeft className={cn('size-[28px]', iconLeftColor)} />}
        </View>
      )}
      <View className="flex-1">
        <Text numberOfLines={1} className="text-text-primary text-body3-semibold">
          {title}
        </Text>
        {showSubtitle && subtitle && (
          <Text numberOfLines={1} className="text-text-secondary text-caption1-regular">
            {subtitle}
          </Text>
        )}
      </View>
      {((showCost && cost) || (showIconRight && IconRight)) && (
        <Trailing action={trailingAction}>
          {showCost && cost && (
            <Text numberOfLines={1} className={cn('max-w-[120px] text-body3-semibold', costColor)}>
              {cost}
            </Text>
          )}
          {showIconRight && IconRight && (
            <IconRight className={cn('size-icon-list', iconRightColor)} />
          )}
        </Trailing>
      )}
    </Row>
  );
};

const rowClassName = 'min-w-[280px] flex-row items-center gap-inset-xs py-inline-xs';

const Row = ({
  action,
  className,
  children,
}: {
  action?: ListItemIconAction;
  className?: string;
  children: ReactNode;
}) =>
  action ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel}
      onPress={action.onPress}
      className={cn(rowClassName, 'active:opacity-pressed', className)}
    >
      {children}
    </Pressable>
  ) : (
    <View className={cn(rowClassName, className)}>{children}</View>
  );

const Trailing = ({ action, children }: { action?: ListItemIconAction; children: ReactNode }) =>
  action ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel}
      onPress={action.onPress}
      className="flex-row items-center gap-s2 active:opacity-pressed"
    >
      {children}
    </Pressable>
  ) : (
    <View className="flex-row items-center gap-s2">{children}</View>
  );

const SvgLogo = ({ Logo }: { Logo: ComponentType<SvgProps> }) => (
  <Logo width="100%" height="100%" />
);
