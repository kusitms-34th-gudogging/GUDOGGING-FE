import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Toggle } from '@/components/common/Toggle';
import { TopBar } from '@/components/common/TopBar';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

interface MypageNotificationScreenProps {
  // OS 알림 권한을 요청하고 허용 여부를 돌려줌
  onRequestPermission: () => Promise<boolean>;
}

// E-05 알림 설정
export const MypageNotificationScreen = ({
  onRequestPermission,
}: MypageNotificationScreenProps) => {
  const { checkupReminder, setCheckupReminder } = useNotificationSettings();

  // 켤 때만 권한을 묻고, 거부하면 꺼진 채로 둠
  const toggle = async (on: boolean) => {
    setCheckupReminder(on && (await onRequestPermission()));
  };

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="알림 설정"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-row items-center justify-between gap-inline-sm px-screen-x pt-stack-md">
        <View className="shrink">
          <Text className="text-text-primary text-body2-bold">꾸준히 쓰는 구독</Text>
          <Text className="text-text-secondary text-caption2-regular">
            결제 3일 전에 점검 알림을 보내드려요.
          </Text>
        </View>
        <Toggle
          value={checkupReminder}
          onValueChange={toggle}
          accessibilityLabel="꾸준히 쓰는 구독 알림"
        />
      </View>
    </View>
  );
};
