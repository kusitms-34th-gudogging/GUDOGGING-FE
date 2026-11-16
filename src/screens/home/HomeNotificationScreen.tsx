import { type Href, router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { BellColorAsset } from '@/assets/graphics';
import { TopBar } from '@/components/common/TopBar';
import { NotificationItem } from '@/components/home/NotificationItem';
import type { AppNotification } from '@/constants/notification';
import { useNotifications } from '@/hooks/useNotifications';
import { formatReceivedAt, groupNotifications } from '@/utils/notification';

// 푸시 알림과 같은 규칙으로 이동 (화면설계서 NOT-001·002)
const targetOf = (n: AppNotification): Href => {
  switch (n.kind) {
    case 'checkup':
      return `/checkup/${n.subscriptionId}?restart=1`;
    case 'payment':
      return `/manage/detail/${n.subscriptionId}`;
    case 'cancel-confirm':
      return `/manage/detail/${n.subscriptionId}?confirmCancel=1`;
  }
};

// H-04 알림 목록 · H-05 알림 없음
export const HomeNotificationScreen = () => {
  const { notifications, markRead } = useNotifications();
  const { today, previous } = groupNotifications(notifications, new Date());
  const sections = [
    { title: '오늘', items: today, isToday: true },
    { title: '이전 알림', items: previous, isToday: false },
  ].filter((s) => s.items.length > 0);

  const open = (n: AppNotification) => {
    markRead(n.id);
    router.push(targetOf(n));
  };

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="알림"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {sections.length === 0 ? (
        // H-05 알림 없음: Figma처럼 상단 바 아래가 아니라 화면 전체 기준 가운데. 뒤로가기 터치는 통과
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center gap-screen-x"
        >
          <BellColorAsset className="size-[104px]" />
          <Text className="text-center text-text-primary text-head3-bold">
            아직 받은 알림이 없어요
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="pb-safe gap-screen-x pt-stack-md">
          {sections.map((section) => (
            <View key={section.title} className="gap-inset-xs">
              <View className="px-screen-x">
                <Text
                  accessibilityRole="header"
                  className="pl-s2 text-text-primary text-body2-semibold"
                >
                  {section.title}
                </Text>
              </View>
              <View>
                {section.items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    state={n.read ? (section.isToday ? 'read' : 'previous') : 'unread'}
                    title={n.title}
                    description={n.description}
                    time={formatReceivedAt(n.receivedAt, new Date())}
                    logo={n.logo}
                    onPress={() => open(n)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
