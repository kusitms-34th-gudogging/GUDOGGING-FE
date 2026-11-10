import { ScrollView, Text, View } from 'react-native';

import { BellIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import { CostCard } from '@/components/home/CostCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { ServiceCard } from '@/components/home/ServiceCard';

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

// H-02 홈 (구독 있음)
export const HomeScreen = () => (
  <View className="pt-safe flex-1 bg-bg-default">
    <TopBar
      variant="main"
      title="홈"
      showBack={false}
      showAction2={false}
      // shortcut: 알림 화면 없음, 알림 화면이 생기면 이동
      action1={{ icon: BellIcon, accessibilityLabel: '알림', onPress: () => {} }}
    />
    {/* 아래는 떠 있는 탭바(하단 안전 영역 + 4 + 52)에 가리지 않게 여백 */}
    <ScrollView contentContainerClassName="gap-inset-lg pb-[120px] pt-stack-md">
      <View className="gap-inline-sm px-screen-x">
        <Text accessibilityRole="header" className="px-s2 text-text-primary text-body1-bold">
          내 구독 정보
        </Text>
        <View className="flex-row gap-[15px]">
          <CostCard
            label="10월 결제 예정"
            amount="54,200원"
            yearAmount="연 650,400원"
            className="flex-1"
          />
          <ServiceCard
            label={`${SUBSCRIPTIONS.length}개 구독 중이예요`}
            subscriptions={SUBSCRIPTIONS}
            className="flex-1"
          />
        </View>
      </View>
      <View className="gap-stack-md">
        <View className="gap-stack-md px-screen-x">
          <SectionHeader title="다가오는 결제" showChevron />
          <Rows items={UPCOMING} />
        </View>
        <View className="h-[2px] bg-bg-subtle" />
        <View className="gap-stack-md px-screen-x">
          <View className="flex-row items-center justify-between">
            <SectionHeader title="내 구독 사용 현황" showChevron />
            <Badge variant="tonal" label="월 17,800원 결제" />
          </View>
          <Rows items={USAGE} />
        </View>
      </View>
    </ScrollView>
    {/* 탭바(하단 안전 영역 + 4 + 52) 위 18 */}
    <View
      pointerEvents="box-none"
      className="pb-safe absolute inset-x-0 bottom-0 items-end px-screen-x"
    >
      {/* shortcut: 누르면 구독 추가(A-01)로 가는지 확인 필요, 정해지면 onPress 연결 */}
      <FloatingButton accessibilityLabel="구독 추가" className="mb-[74px]" />
    </View>
  </View>
);
