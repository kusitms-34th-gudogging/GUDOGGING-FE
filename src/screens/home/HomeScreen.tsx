import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { BellIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import { CheckupPromptCard } from '@/components/home/CheckupPromptCard';
import { CostCard } from '@/components/home/CostCard';
import { HomeEmptyState } from '@/components/home/HomeEmptyState';
import { SectionHeader } from '@/components/home/SectionHeader';
import { ServiceCard, type ServiceCardSubscription } from '@/components/home/ServiceCard';
import { cn } from '@/utils/cn';

// shortcut: 구독 API 없이 Figma 예시 값, 구독 목록 API 연동 시 API 훅으로 교체
const LOGO = require('@/assets/images/logo_placeholder.png');
const SUBSCRIPTIONS = [
  { id: 'netflix', nextDate: new Date(2026, 9, 17) },
  { id: 'youtube', nextDate: new Date(2026, 9, 19) },
  { id: 'youtube-2', nextDate: new Date(2026, 9, 22) },
  { id: 'chatgpt', nextDate: new Date(2026, 9, 25) },
  { id: 'notion', nextDate: new Date(2026, 9, 28) },
  { id: 'figma', nextDate: new Date(2026, 9, 30) },
];
const UPCOMING = [
  { id: 'netflix', name: '넷플릭스', summary: '10월 17일 결제 · D-1', cost: '13,500원' },
  { id: 'youtube', name: '유튜브 프리미엄', summary: '10월 17일 결제 · D-3', cost: '14,900원' },
  { id: 'youtube-2', name: '유튜브 프리미엄', summary: '10월 22일 결제 · D-5', cost: '14,900원' },
];
const USAGE = [
  { id: 'netflix', name: '넷플릭스', summary: '유지 추천 NN%', cost: '13,500원' },
  { id: 'youtube', name: '유튜브 프리미엄', summary: '유지 추천 NN%', cost: '14,900원' },
];

const Rows = ({ items }: { items: typeof UPCOMING }) => (
  <View className="gap-stack-sm">
    {items.map((s) => (
      <ListItem
        key={s.id}
        title={s.name}
        subtitle={s.summary}
        showSubtitle
        logo={LOGO}
        showLogo
        cost={s.cost}
        showCost
      />
    ))}
  </View>
);

interface HomeScreenProps {
  // 비어 있으면 H-01(등록된 구독 없음)
  subscriptions?: ServiceCardSubscription[];
  // 비어 있으면 H-03(점검 기록 없음): 사용 현황 대신 점검 유도 카드
  usage?: typeof USAGE;
}

// H-01 홈 (등록된 구독 없음) · H-02 홈 (구독 있음) · H-03 홈 (점검 유도)
export const HomeScreen = ({ subscriptions = SUBSCRIPTIONS, usage = USAGE }: HomeScreenProps) => {
  const isEmpty = subscriptions.length === 0;

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="main"
        title="홈"
        showBack={false}
        showAction2={false}
        // shortcut: 알림 화면 없음, 알림 화면이 생기면 이동
        action1={{ icon: BellIcon, accessibilityLabel: '알림', onPress: () => {} }}
      />
      {/* 아래는 떠 있는 탭바(하단 안전 영역 + 4 + 52)에 가리지 않게 여백. 빈 상태는 화면 높이만큼 채우고 안에서 탭바만큼 뺌 */}
      <ScrollView
        contentContainerClassName={cn('gap-inset-lg pt-stack-md', isEmpty ? 'grow' : 'pb-[120px]')}
      >
        <View className="gap-inline-sm px-screen-x">
          <Text accessibilityRole="header" className="px-s2 text-text-primary text-body1-bold">
            내 구독 정보
          </Text>
          <View className="flex-row gap-[15px]">
            {isEmpty ? (
              <CostCard
                label={`${new Date().getMonth() + 1}월 결제 예정`}
                amount="0원"
                yearAmount="연 0원"
                className="flex-1"
              />
            ) : (
              <CostCard
                label="10월 결제 예정"
                amount="54,200원"
                yearAmount="연 650,400원"
                className="flex-1"
              />
            )}
            <ServiceCard
              label={`${subscriptions.length}개 구독 중이에요`}
              subscriptions={subscriptions}
              className="flex-1"
            />
          </View>
        </View>
        {isEmpty ? (
          <HomeEmptyState onRegister={() => router.push('/register')} />
        ) : (
          <View className="gap-stack-md">
            <View className="gap-stack-md px-screen-x">
              <SectionHeader title="다가오는 결제" showChevron />
              <Rows items={UPCOMING} />
            </View>
            <View className="h-[2px] bg-bg-subtle" />
            <View className="gap-stack-md px-screen-x">
              {usage.length > 0 ? (
                <>
                  <View className="flex-row items-center justify-between">
                    <SectionHeader title="내 구독 사용 현황" showChevron />
                    <Badge variant="tonal" label="월 17,800원 결제" />
                  </View>
                  <Rows items={usage} />
                </>
              ) : (
                <>
                  <SectionHeader title="내 구독 사용 현황" />
                  {/* shortcut: 점검 진입이 임시 목록(/checkup), 점검 진입 화면이 정해지면 그 경로로 */}
                  <CheckupPromptCard onPress={() => router.push('/checkup')} />
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      {/* 탭바(하단 안전 영역 + 4 + 52) 위 18. 구독이 없으면 빈 상태 버튼이 대신해서 없음 */}
      {!isEmpty && (
        <View
          pointerEvents="box-none"
          className="pb-safe absolute inset-x-0 bottom-0 items-end px-screen-x"
        >
          {/* shortcut: 누르면 구독 추가(A-01)로 가는지 확인 필요, 정해지면 onPress 연결 */}
          <FloatingButton accessibilityLabel="구독 추가" className="mb-[74px]" />
        </View>
      )}
    </View>
  );
};
