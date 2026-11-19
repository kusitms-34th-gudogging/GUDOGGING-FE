import { router } from 'expo-router';
import { View } from 'react-native';

import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { Toggle } from '@/components/common/Toggle';
import { TopBar } from '@/components/common/TopBar';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useUpdateNotificationSettings } from '@/hooks/useUpdateNotificationSettings';

interface MypageNotificationScreenProps {
  // OS 알림 권한을 요청하고 허용 여부를 돌려줌
  onRequestPermission: () => Promise<boolean>;
}

// E-05 알림 설정
export const MypageNotificationScreen = ({
  onRequestPermission,
}: MypageNotificationScreenProps) => {
  const { data: settings, isError, refetch } = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  // 저장하는 동안은 바꾼 값을 먼저 보여 주고, 실패하면 서버 값으로 돌아감
  const enabled = update.isPending
    ? update.variables.paymentReminderEnabled
    : settings?.paymentReminderEnabled;

  // 켤 때만 권한을 묻고, 거부하면 꺼진 채로 둠
  // shortcut: 저장 실패 안내는 디자인에 없어 토글만 되돌아감, 디자인 나오면 토스트 추가
  const toggle = async (on: boolean) => {
    if (on && !(await onRequestPermission())) return;
    update.mutate({ paymentReminderEnabled: on });
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
      {enabled === undefined ? (
        <QueryState isError={isError} onRetry={refetch} />
      ) : (
        <View className="flex-row items-center justify-between gap-inline-sm px-screen-x pt-stack-md">
          <View className="shrink">
            <Text className="text-text-primary text-body2-bold">꾸준히 쓰는 구독</Text>
            <Text className="text-text-secondary text-caption2-regular">
              결제 3일 전에 점검 알림을 보내드려요.
            </Text>
          </View>
          <Toggle
            value={enabled}
            onValueChange={toggle}
            accessibilityLabel="꾸준히 쓰는 구독 알림"
          />
        </View>
      )}
    </View>
  );
};
