import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { BellColorAsset } from '@/assets/graphics';
import { Cta } from '@/components/common/Cta';

interface NotificationSheetProps {
  onAllow: () => void;
  onLater: () => void;
}

// 딤을 눌러도 닫히지 않아야 해서 gorhom 모달 대신 화면 위에 직접 올림
export const NotificationSheet = ({ onAllow, onLater }: NotificationSheetProps) => (
  <View accessibilityViewIsModal className="absolute inset-0 justify-end">
    <Animated.View entering={FadeIn.duration(200)} className="absolute inset-0 bg-bg-dim" />
    <Animated.View
      entering={SlideInDown.duration(300)}
      className="items-center rounded-t-sheet bg-bg-default px-screen-x pb-s40"
    >
      <View className="mt-s20 h-[5px] w-[54px] rounded-full bg-icon-secondary" />
      <BellColorAsset accessible={false} className="mt-[57px] size-[108px]" />
      <View className="mt-s20 items-center gap-inline-sm">
        <Text accessibilityRole="header" className="text-text-primary text-head3-bold">
          결제 3일 전에 알려드릴게요.
        </Text>
        <Text className="text-center text-text-primary text-body2-regular">
          {'결제 전에 최근 이용 경험을 확인하고,\n계속 이용할지 결정할 수 있어요.'}
        </Text>
      </View>
      <View className="mt-s24 w-full gap-stack-md">
        <Cta label="알림 받기" onPress={onAllow} />
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onLater}
          className="items-center active:opacity-pressed"
        >
          <Text className="text-text-tertiary text-caption1-regular">다음에 설정하기</Text>
        </Pressable>
      </View>
    </Animated.View>
  </View>
);
