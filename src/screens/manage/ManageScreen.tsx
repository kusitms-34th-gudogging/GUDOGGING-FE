import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ChevronDownIcon, MoreIcon, TrashIcon } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ListItem } from '@/components/common/ListItem';
import { Modal } from '@/components/common/Modal';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { TopBar } from '@/components/common/TopBar';
import { MoreMenu } from '@/components/manage/MoreMenu';
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

// M-01 등록된 구독 없음 · M-02 구독 중 탭(.1 더보기 · .2 삭제 선택 · .3 삭제 모달) · M-04 구독 종료 탭
export const ManageScreen = ({
  active = ACTIVE_SAMPLE,
  ended = ENDED_SAMPLE,
}: ManageScreenProps) => {
  // shortcut: 삭제는 화면 안 목록에서만 빠짐, 구독 삭제 API 연동 시 호출 후 목록 다시 불러오기
  const [lists, setLists] = useState({ active, ended });
  const [tab, setTab] = useState<Tab>('active');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEmpty = lists.active.length === 0 && lists.ended.length === 0;
  const today = new Date();

  const stopSelecting = () => {
    setSelecting(false);
    setPicked([]);
  };
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const deletePicked = () => {
    setLists((l) => ({
      active: tab === 'active' ? l.active.filter((s) => !picked.includes(s.id)) : l.active,
      ended: tab === 'ended' ? l.ended.filter((s) => !picked.includes(s.id)) : l.ended,
    }));
    stopSelecting();
  };

  // 결제일 순 · 해지일 순(최근 해지가 위)
  // shortcut: 정렬 기준 바꾸는 메뉴는 옵션이 정해지지 않아 고정
  const items =
    tab === 'active'
      ? [...lists.active]
          .sort((a, b) => (a.nextDate?.getTime() ?? Infinity) - (b.nextDate?.getTime() ?? Infinity))
          .map((s) => ({ ...s, subtitle: activeSubtitle(s, today) }))
      : [...lists.ended]
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
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => setMenuOpen(true) }}
      />
      {/* 삭제 선택 중 빠져나가는 동작은 디자인에 없어 같은 메뉴에서 '선택 취소'로 */}
      <MoreMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        options={[
          selecting
            ? { label: '선택 취소', onSelect: stopSelecting }
            : { label: '삭제', destructive: true, onSelect: () => setSelecting(true) },
        ]}
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
                  { value: 'active', label: '구독 중', count: lists.active.length },
                  { value: 'ended', label: '구독 종료', count: lists.ended.length },
                ]}
                selected={tab}
                onSelect={(next) => {
                  setTab(next);
                  stopSelecting();
                }}
              />
            </View>
            <View className="gap-stack-md">
              <View className="flex-row items-center justify-between pl-s2">
                {selecting ? (
                  <>
                    <Text className="text-text-primary text-body2-semibold">
                      {`${picked.length}개 선택`}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="선택한 구독 삭제"
                      disabled={picked.length === 0}
                      onPress={() => setConfirmOpen(true)}
                      className={cn(
                        'flex-row items-center gap-s2 py-inline-xs active:opacity-pressed',
                        picked.length === 0 && 'opacity-disabled',
                      )}
                    >
                      <Text className="text-text-error text-caption1-regular">삭제</Text>
                      <TrashIcon className="size-icon-xs text-icon-error" />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text
                      className={cn(
                        'text-text-primary',
                        tab === 'active' ? 'text-body2-semibold' : 'text-body1-semibold',
                      )}
                    >
                      {tab === 'active'
                        ? `월 ${formatWon(sumMonthly(lists.active))}`
                        : `월 ${formatWon(sumMonthly(lists.ended))} 절약`}
                    </Text>
                    <View className="flex-row items-center gap-s2 py-inline-xs">
                      <Text className="text-text-secondary text-caption1-regular">
                        {tab === 'active' ? '결제일 순' : '해지일 순'}
                      </Text>
                      <ChevronDownIcon className="size-icon-xs text-icon-secondary" />
                    </View>
                  </>
                )}
              </View>
              <View className="gap-stack-sm">
                {items.map((s) =>
                  selecting ? (
                    // 삭제 선택 중엔 행 어디를 눌러도 체크 (상세 이동 없음)
                    <Pressable
                      key={s.id}
                      accessibilityRole="checkbox"
                      accessibilityLabel={s.name}
                      accessibilityState={{ checked: picked.includes(s.id) }}
                      onPress={() => toggle(s.id)}
                    >
                      <ListItem
                        title={s.name}
                        subtitle={s.subtitle}
                        showSubtitle
                        logo={LOGO}
                        showLogo
                        cost={formatWon(s.amount)}
                        showCost
                        showCheckBox
                        checked={picked.includes(s.id)}
                        onCheckedChange={() => toggle(s.id)}
                      />
                    </Pressable>
                  ) : (
                    // 행 전체가 터치 영역 → 구독 상세
                    // shortcut: 구독 종료 탭은 지난 구독 상세(M-05)가 아직 없어 이동 없음
                    <ListItem
                      key={s.id}
                      title={s.name}
                      subtitle={s.subtitle}
                      showSubtitle
                      logo={LOGO}
                      showLogo
                      cost={formatWon(s.amount)}
                      showCost
                      iconRightAction={
                        tab === 'active'
                          ? {
                              accessibilityLabel: `${s.name} 상세`,
                              onPress: () => router.push(`/subscription/${s.id}`),
                            }
                          : undefined
                      }
                    />
                  ),
                )}
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
      <Modal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        buttons="both"
        title={`구독 ${picked.length}개를 삭제할까요?`}
        description="삭제하면 모든 정보가 사라져요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onConfirm={deletePicked}
      />
    </View>
  );
};
