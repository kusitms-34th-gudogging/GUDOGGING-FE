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
import { ServiceCard } from '@/components/home/ServiceCard';
import { cn } from '@/utils/cn';
import { formatWon } from '@/utils/formatPayment';
import {
  daysUntil,
  type HomeSubscription,
  lowUsage,
  monthDue,
  nextCheckupTarget,
  upcomingPayments,
  yearTotal,
} from '@/utils/homeSummary';

const LOGO = require('@/assets/images/logo_placeholder.png');
const inDays = (n: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
};
// shortcut: 구독 API 없이 오늘 기준 샘플, 구독 목록 API 연동 시 API 훅으로 교체 (usage·checked는 점검 결과)
// 점검 화면이 점검 샘플에서 서비스를 찾으므로 같은 id를 씀
const SAMPLE: HomeSubscription[] = [
  {
    id: 'netflix',
    name: '넷플릭스',
    amount: 13500,
    cycle: 1,
    unit: '개월',
    nextDate: inDays(1),
    usage: 45,
  },
  {
    id: 'melon',
    name: '멜론',
    amount: 10900,
    cycle: 1,
    unit: '개월',
    nextDate: inDays(3),
    usage: 30,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    amount: 29000,
    cycle: 1,
    unit: '개월',
    nextDate: inDays(5),
    usage: 80,
  },
  { id: 'coupang', name: '쿠팡 와우', amount: 7890, cycle: 1, unit: '개월', nextDate: inDays(12) },
  { id: 'millie', name: '밀리의 서재', amount: 9900, cycle: 1, unit: '개월', nextDate: inDays(20) },
  { id: 'duolingo', name: '듀오링고', amount: 1100, cycle: 1, unit: '개월', nextDate: inDays(25) },
];

const dateLabel = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 결제`;

interface HomeScreenProps {
  // 비어 있으면 H-01(등록된 구독 없음)
  subscriptions?: HomeSubscription[];
}

// H-01 홈 (등록된 구독 없음) · H-02 홈 (구독 있음) · H-03 홈 (예정 결제 없음 · 점검 유도)
export const HomeScreen = ({ subscriptions = SAMPLE }: HomeScreenProps) => {
  const today = new Date();
  const isEmpty = subscriptions.length === 0;
  const upcoming = upcomingPayments(subscriptions, today);
  const usage = lowUsage(subscriptions);
  // 점검 기록이 한 건도 없으면 사용 현황 대신 점검 유도 카드 (H-03)
  const hasCheckup = subscriptions.some((s) => s.usage !== undefined);
  const checkupTarget = nextCheckupTarget(subscriptions, today);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="main"
        title="홈"
        showBack={false}
        showAction2={false}
        // shortcut: 알림 목록 화면 없음(설계서 '추후 추가'), 생기면 이동
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
            <CostCard
              label={`${today.getMonth() + 1}월 결제 예정`}
              amount={formatWon(monthDue(subscriptions, today))}
              yearAmount={`연 ${formatWon(yearTotal(subscriptions, today))}`}
              className="flex-1"
            />
            <ServiceCard
              label={`${subscriptions.length}개 구독 중이에요`}
              subscriptions={subscriptions.flatMap((s) =>
                s.nextDate ? [{ id: s.id, nextDate: s.nextDate }] : [],
              )}
              className="flex-1"
            />
          </View>
        </View>
        {isEmpty ? (
          <HomeEmptyState onRegister={() => router.push('/register')} />
        ) : (
          <View className="gap-stack-md">
            <View className="gap-stack-md px-screen-x">
              <SectionHeader
                title="다가오는 결제"
                showChevron
                onPress={() => router.navigate('/calendar')}
              />
              {!upcoming.within7 && (
                <Text className="px-s2 text-text-primary text-body1-semibold">
                  7일 안에 결제 예정인 구독이 없어요
                </Text>
              )}
              <View className="gap-stack-sm">
                {upcoming.items.map((s) => (
                  <ListItem
                    key={s.id}
                    title={s.name}
                    subtitle={
                      upcoming.within7
                        ? `${dateLabel(s.nextDate!)} · D-${daysUntil(s.nextDate!, today)}`
                        : dateLabel(s.nextDate!)
                    }
                    showSubtitle
                    logo={LOGO}
                    showLogo
                    cost={formatWon(s.amount)}
                    showCost
                    // 행 전체가 터치 영역. 이번 주기에 점검 안 한 구독은 점검으로
                    // shortcut: 점검한 구독은 구독 상세(M-03) 화면이 없어 이동 없음, 생기면 연결
                    iconRightAction={
                      s.checked
                        ? undefined
                        : {
                            accessibilityLabel: `${s.name} 점검하기`,
                            onPress: () => router.push(`/checkup/${s.id}?restart=1`),
                          }
                    }
                  />
                ))}
              </View>
            </View>
            <View className="h-[2px] bg-bg-subtle" />
            <View className="gap-stack-md px-screen-x">
              {hasCheckup ? (
                <>
                  <View className="flex-row items-center justify-between">
                    <SectionHeader
                      title="내 구독 사용 현황"
                      showChevron
                      onPress={() => router.navigate('/manage')}
                    />
                    <Badge variant="tonal" label={`월 ${formatWon(usage.monthTotal)} 결제`} />
                  </View>
                  {/* shortcut: 항목을 누르면 구독 상세(M-03)로 가야 하는데 화면이 없어 이동 없음 */}
                  <View className="gap-stack-sm">
                    {usage.items.map((s) => (
                      <ListItem
                        key={s.id}
                        title={s.name}
                        subtitle={`유지 추천 ${s.usage}%`}
                        showSubtitle
                        logo={LOGO}
                        showLogo
                        cost={formatWon(s.amount)}
                        showCost
                      />
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <SectionHeader title="내 구독 사용 현황" />
                  <CheckupPromptCard
                    onPress={() =>
                      checkupTarget && router.push(`/checkup/${checkupTarget.id}?restart=1`)
                    }
                  />
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
          <FloatingButton
            accessibilityLabel="구독 추가"
            onPress={() => router.push('/register')}
            className="mb-[74px]"
          />
        </View>
      )}
    </View>
  );
};
