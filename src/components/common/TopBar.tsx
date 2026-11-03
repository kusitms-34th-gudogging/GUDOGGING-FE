import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { ChevronLeftIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

import { IconButton } from './IconButton';

// 아이콘 쪽은 inset-2xs(4)로 44 터치 영역을 화면 끝으로, 텍스트 쪽은 screen-x(20)
const topBarVariants = cva('h-[56px] flex-row items-center gap-inline-sm', {
  variants: {
    variant: {
      main: 'pl-screen-x pr-inset-2xs',
      detail: 'px-inset-2xs',
    },
  },
  defaultVariants: { variant: 'main' },
});

const topBarTitleVariants = cva('flex-1 text-text-primary', {
  variants: {
    variant: {
      main: 'text-head2-bold',
      detail: 'text-center text-head4-bold',
    },
  },
  defaultVariants: { variant: 'main' },
});

interface TopBarAction {
  icon: ComponentType<SvgProps>;
  accessibilityLabel: string;
  onPress: () => void;
}

interface TopBarProps extends VariantProps<typeof topBarVariants> {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showAction1?: boolean;
  action1?: TopBarAction;
  showAction2?: boolean;
  action2?: TopBarAction;
  showTextAction?: boolean;
  textAction?: string;
  onTextActionPress?: () => void;
  className?: string;
}

// 아이콘 버튼은 44 고정 슬롯 안에 둬서 꺼도 타이틀 위치가 안 움직임
const ActionSlot = ({ show, action }: { show?: boolean; action?: TopBarAction }) => (
  <View className="size-touch-target">
    {show && action && <IconButton size="md" {...action} />}
  </View>
);

export const TopBar = ({
  variant,
  title,
  showBack = true,
  onBack,
  showAction1 = true,
  action1,
  showAction2 = true,
  action2,
  showTextAction,
  textAction,
  onTextActionPress,
  className,
}: TopBarProps) => {
  const isDetail = variant === 'detail';

  return (
    <View className={cn(topBarVariants({ variant }), className)}>
      {/* Detail은 좌우 슬롯을 88로 맞춰 타이틀을 가운데 고정 */}
      {isDetail && (
        <View className="w-[88px] flex-row">
          <ActionSlot
            show={showBack}
            action={
              onBack && { icon: ChevronLeftIcon, accessibilityLabel: '뒤로 가기', onPress: onBack }
            }
          />
        </View>
      )}
      <Text
        numberOfLines={1}
        accessibilityRole="header"
        className={topBarTitleVariants({ variant })}
      >
        {title}
      </Text>
      <View className={cn('flex-row justify-end', isDetail && 'w-[88px]')}>
        {isDetail && showTextAction && textAction && onTextActionPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={onTextActionPress}
            className="h-touch-target justify-center pl-inset-xs pr-inset-md active:opacity-pressed"
          >
            <Text numberOfLines={1} className="max-w-[64px] text-text-secondary text-body2-regular">
              {textAction}
            </Text>
          </Pressable>
        ) : (
          <>
            <ActionSlot show={showAction2} action={action2} />
            <ActionSlot show={showAction1} action={action1} />
          </>
        )}
      </View>
    </View>
  );
};
