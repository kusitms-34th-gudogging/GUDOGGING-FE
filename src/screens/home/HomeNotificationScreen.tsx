import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { BellColorAsset } from '@/assets/graphics';
import { TopBar } from '@/components/common/TopBar';
import { NotificationItem } from '@/components/home/NotificationItem';
import { type AppNotification, NOTIFICATION_SAMPLE } from '@/constants/notification';

interface HomeNotificationScreenProps {
  notifications?: AppNotification[];
}

// H-04 알림 목록 · H-05 알림 없음
export const HomeNotificationScreen = ({
  notifications = NOTIFICATION_SAMPLE,
}: HomeNotificationScreenProps) => {
  const sections = [
    { title: '오늘', items: notifications.filter((n) => n.today) },
    { title: '이전 알림', items: notifications.filter((n) => !n.today) },
  ].filter((s) => s.items.length > 0);

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
                    state={n.today ? 'unread' : 'previous'}
                    title={n.title}
                    description={n.description}
                    time={n.time}
                    logo={n.logo}
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
