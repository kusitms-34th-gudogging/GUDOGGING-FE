import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ChevronDownIcon, MoreIcon } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ListItem } from '@/components/common/ListItem';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { TopBar } from '@/components/common/TopBar';
import { cn } from '@/utils/cn';
import { formatWon } from '@/utils/formatPayment';
import { daysUntil, type HomeSubscription, monthly } from '@/utils/homeSummary';

export interface EndedSubscription extends HomeSubscription {
  cancelledAt: Date;
  totalSpent: number;
}

const LOGO = require('@/assets/images/logo_placeholder.png');
const inDays = (n: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
};
// shortcut: 구독 API 없이 오늘 기준 샘플, 구독 목록 API 연동 시 API 훅으로 교체
const ACTIVE_SAMPLE: HomeSubscription[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    amount: 29000,
    cycle: 1,
    unit: '개월',
    nextDate: inDays(1),
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    amount: 14900,
    cycle: 1,
    unit: '개월',
    nextDate: inDays(1),
  },
  { id: 'netflix', name: '넷플릭스', amount: 13500, cycle: 1, unit: '개월', nextDate: inDays(5) },
  { id: 'melon', name: '멜론', amount: 10900, cycle: 1, unit: '개월', nextDate: inDays(9) },
  { id: 'coupang', name: '쿠팡 와우', amount: 7890, cycle: 1, unit: '개월', nextDate: inDays(12) },
  { id: 'millie', name: '밀리의 서재', amount: 9900, cycle: 1, unit: '개월', nextDate: inDays(20) },
];
const ENDED_SAMPLE: EndedSubscription[] = [
  {
    id: 'watcha',
    name: '왓챠',
    amount: 7900,
    cycle: 1,
    unit: '개월',
    cancelledAt: inDays(-26),
    totalSpent: 47400,
  },
  {
    id: 'tving',
    name: '티빙',
    amount: 9900,
    cycle: 1,
    unit: '개월',
    cancelledAt: inDays(-40),
    totalSpent: 59400,
  },
];

type Tab = 'active' | 'ended';

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
// 매월 결제는 '매월 17일', 그 외 주기는 다음 결제일
const activeSubtitle = (s: HomeSubscription, today: Date) => {
  if (!s.nextDate) return '';
  const when =
    s.unit === '개월' && s.cycle === 1 ? `매월 ${s.nextDate.getDate()}일` : monthDay(s.nextDate);
  return `${when} · D-${daysUntil(s.nextDate, today)}`;
};
const sumMonthly = (subs: HomeSubscription[]) => subs.reduce((sum, s) => sum + monthly(s), 0);

interface ManageScreenProps {
  // 둘 다 비어 있으면 M-01(등록된 구독 없음)
  active?: HomeSubscription[];
  ended?: EndedSubscription[];
}

// M-01 등록된 구독 없음 · M-02 구독 중 탭 · M-04 구독 종료 탭
export const ManageScreen = ({
  active = ACTIVE_SAMPLE,
  ended = ENDED_SAMPLE,
}: ManageScreenProps) => {
  const [tab, setTab] = useState<Tab>('active');
  const isEmpty = active.length === 0 && ended.length === 0;
  const today = new Date();

  // 결제일 순 · 해지일 순(최근 해지가 위)
  // shortcut: 정렬 기준 바꾸는 메뉴는 옵션이 정해지지 않아 고정
  const items =
    tab === 'active'
      ? [...active]
          .sort((a, b) => (a.nextDate?.getTime() ?? Infinity) - (b.nextDate?.getTime() ?? Infinity))
          .map((s) => ({ ...s, subtitle: activeSubtitle(s, today) }))
      : [...ended]
          .sort((a, b) => b.cancelledAt.getTime() - a.cancelledAt.getTime())
          .map((s) => ({
            ...s,
            subtitle: `${monthDay(s.cancelledAt)} 해지 · 총 지출 ${formatWon(s.totalSpent)}`,
          }));

  return (
    <View className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar
        title="구독 관리"
        showAction2={false}
        showAction1={!isEmpty}
        // shortcut: 더보기 메뉴(M-02.1 → 삭제 M-02.2)는 다음 작업에서 연결
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => {} }}
      />
      {isEmpty ? (
        // 떠 있는 탭바(52 + 하단 4)를 빼고 남은 영역에서 세로 중앙
        <View className="flex-1 items-center justify-center gap-stack-md px-screen-x pb-[56px]">
          <View className="items-center gap-s2">
            <Text className="text-center text-text-primary text-head3-bold">
              관리 중인 구독이 없어요
            </Text>
            <Text className="text-center text-text-secondary text-body3-regular">
              {'스크린샷, Gmail, 직접 입력으로\n구독을 등록할 수 있어요'}
            </Text>
          </View>
          <Button size="sm" label="구독 등록하기" onPress={() => router.push('/register')} />
        </View>
      ) : (
        <>
          {/* 아래는 떠 있는 탭바·+ 버튼에 가리지 않게 여백 */}
          <ScrollView contentContainerClassName="gap-inset-lg px-screen-x pb-[120px] pt-stack-md">
            <View className="w-[164px]">
              <SegmentedControl
                options={[
                  { value: 'active', label: '구독 중', count: active.length },
                  { value: 'ended', label: '구독 종료', count: ended.length },
                ]}
                selected={tab}
                onSelect={setTab}
              />
            </View>
            <View className="gap-stack-md">
              <View className="flex-row items-center justify-between pl-s2">
                <Text
                  className={cn(
                    'text-text-primary',
                    tab === 'active' ? 'text-body2-semibold' : 'text-body1-semibold',
                  )}
                >
                  {tab === 'active'
                    ? `월 ${formatWon(sumMonthly(active))}`
                    : `월 ${formatWon(sumMonthly(ended))} 절약`}
                </Text>
                <View className="flex-row items-center gap-s2 py-inline-xs">
                  <Text className="text-text-secondary text-caption1-regular">
                    {tab === 'active' ? '결제일 순' : '해지일 순'}
                  </Text>
                  <ChevronDownIcon className="size-icon-xs text-icon-secondary" />
                </View>
              </View>
              {/* shortcut: 행을 누르면 구독 상세(M-03·M-05)로 가야 하는데 화면이 없어 이동 없음 */}
              <View className="gap-stack-sm">
                {items.map((s) => (
                  <ListItem
                    key={s.id}
                    title={s.name}
                    subtitle={s.subtitle}
                    showSubtitle
                    logo={LOGO}
                    showLogo
                    cost={formatWon(s.amount)}
                    showCost
                  />
                ))}
              </View>
            </View>
          </ScrollView>
          {/* 탭바(하단 안전 영역 + 4 + 52) 위 18 */}
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
        </>
      )}
    </View>
  );
};
