import type { ComponentType, ReactNode } from 'react';
import { Image, type ImageSourcePropType, Pressable, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { Text } from '@/components/common/Text';
import { cn } from '@/utils/cn';

import { Checkbox } from './Checkbox';

// 체크박스가 없으면 행 전체, 있으면 오른쪽 금액·아이콘만 누르는 동작
interface ListItemIconAction {
  accessibilityLabel: string;
  onPress: () => void;
  testID?: string;
}

interface ListItemProps {
  title: string;
  // 일부만 색을 바꿀 땐 <Text> 조각을 넘김 (예: D-n 강조)
  subtitle?: ReactNode;
  showSubtitle?: boolean;
  cost?: string;
  showCost?: boolean;
  costColor?: string;
  // 금액 자리에 긴 글(구독 상세 정보 값 등)을 둘 때 최대 폭 120 대신 남는 폭까지 쓰고 말줄임
  costFullWidth?: boolean;
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
  checkBoxTestID?: string;
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
  costFullWidth,
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
  checkBoxTestID,
  checkBoxLocked,
  className,
}: ListItemProps) => {
  // 누르는 영역: 체크박스가 없으면 행 전체, 있으면 체크박스와 오른쪽(금액·아이콘)을 따로
  const rowAction = showCheckBox ? undefined : iconRightAction;
  const trailingAction = showCheckBox ? iconRightAction : undefined;

  return (
    <Row action={rowAction} className={className}>
      {showLogo && logo && (
        // Figma 로고 원에 테두리 없음 (컴포넌트 설명의 border/subtle 1px은 GUI에 없어 GUI를 따름)
        <View className="size-logo-card overflow-hidden rounded-full">
          {typeof logo === 'function' ? (
            <SvgLogo Logo={logo} />
          ) : (
            <Image source={logo} className="size-full" />
          )}
        </View>
      )}
      {showIconLeft && IconLeft && <IconLeft className={cn('size-[28px]', iconLeftColor)} />}
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
      {((showCost && cost) || (showIconRight && IconRight) || showCheckBox) && (
        <View className="shrink flex-row items-center gap-inline-xs">
          {((showCost && cost) || (showIconRight && IconRight)) && (
            <Trailing action={trailingAction}>
              {showCost && cost && (
                <Text
                  numberOfLines={1}
                  className={cn(
                    costFullWidth ? 'shrink' : 'max-w-[120px]',
                    'text-body3-semibold',
                    costColor,
                  )}
                >
                  {cost}
                </Text>
              )}
              {showIconRight && IconRight && (
                <IconRight className={cn('size-icon-list', iconRightColor)} />
              )}
            </Trailing>
          )}
          {showCheckBox && (
            // Figma 인스턴스 34×44(박스 가운데)에 맞춤: 44 체크박스를 34 틀 가운데 두고 양옆 5씩 잘라냄
            <View className="w-[34px] flex-row justify-center overflow-hidden">
              <Checkbox
                checked={checked}
                testID={checkBoxTestID}
                onCheckedChange={(next) => onCheckedChange?.(next)}
                locked={checkBoxLocked}
                accessibilityLabel={title}
              />
            </View>
          )}
        </View>
      )}
    </Row>
  );
};

const rowClassName = 'min-w-[280px] flex-row items-center gap-inline-md py-inline-xs';

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
      testID={action.testID}
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
      testID={action.testID}
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel}
      onPress={action.onPress}
      className="shrink flex-row items-center gap-s2 active:opacity-pressed"
    >
      {children}
    </Pressable>
  ) : (
    <View className="shrink flex-row items-center gap-s2">{children}</View>
  );

const SvgLogo = ({ Logo }: { Logo: ComponentType<SvgProps> }) => (
  <Logo width="100%" height="100%" />
);
