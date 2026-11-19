import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ChevronDownIcon, MoreIcon, TrashIcon } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ListItem } from '@/components/common/ListItem';
import { Modal } from '@/components/common/Modal';
import { MoreMenu } from '@/components/common/MoreMenu';
import { QueryState } from '@/components/common/QueryState';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { useDeleteSubscriptions } from '@/hooks/useDeleteSubscriptions';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { formatWon } from '@/utils/formatPayment';

const LOGO = require('@/assets/images/logo_placeholder.png');

type Tab = 'ACTIVE' | 'ENDED';

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

// M-01 등록된 구독 없음 · M-02 구독 중 탭(.1 더보기 · .2 삭제 선택 · .3 삭제 모달) · M-04 구독 종료 탭
export const ManageScreen = () => {
  const [tab, setTab] = useState<Tab>('ACTIVE');
  const { data, isError, refetch, isPlaceholderData } = useSubscriptions(tab);
  const deleteSubscriptions = useDeleteSubscriptions();
  const { show } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEmpty = data?.activeCount === 0 && data.endedCount === 0;

  const stopSelecting = () => {
    setSelecting(false);
    setPicked([]);
  };
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const deletePicked = () =>
    deleteSubscriptions.mutate(picked, {
      onSuccess: () => {
        show({ type: 'success', message: `구독 ${picked.length}개를 삭제했어요` });
        stopSelecting();
      },
      // 임의: 삭제 실패 문구는 디자인에 없음
      onError: () => show({ type: 'error', message: '구독을 삭제하지 못했어요' }),
    });

  // 정렬(결제일 순 · 해지일 순)은 서버 기본값
  // shortcut: 정렬 기준 바꾸는 메뉴는 옵션이 정해지지 않아 고정
  // 탭을 막 바꿔 이전 탭 데이터(placeholder)면 형식이 안 맞아 만들지 않음 (구독 중엔 해지일이 없음)
  const items = (isPlaceholderData ? [] : (data?.subscriptions ?? [])).map((s) => ({
    ...s,
    subtitle:
      tab === 'ACTIVE'
        ? // 매월 결제는 '매월 17일', 그 외 주기는 다음 결제일
          `${s.unit === '개월' && s.cycle === 1 ? `매월 ${s.nextDate!.getDate()}일` : monthDay(s.nextDate!)} · D-${s.dDay}`
        : `${monthDay(s.cancelledAt!)} 해지 · 총 지출 ${formatWon(s.totalSpent!)}`,
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
      {!data ? (
        <QueryState isError={isError} onRetry={refetch} />
      ) : isEmpty ? (
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
                  { value: 'ACTIVE', label: '구독 중', count: data.activeCount },
                  { value: 'ENDED', label: '구독 종료', count: data.endedCount },
                ]}
                selected={tab}
                onSelect={(next) => {
                  setTab(next);
                  stopSelecting();
                }}
              />
            </View>
            {/* 탭을 바꿔 새 목록이 오기 전엔 이전 탭 데이터라 금액·목록을 숨기고 탭·개수만 둠 */}
            {!isPlaceholderData && (
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
                      <Text className="text-text-primary text-body2-semibold">
                        {tab === 'ACTIVE'
                          ? `월 ${formatWon(data.monthlyTotal)}`
                          : `월 ${formatWon(data.monthlyTotal)} 절약`}
                      </Text>
                      <View className="flex-row items-center gap-s2 py-inline-xs">
                        <Text className="text-text-secondary text-caption1-regular">
                          {tab === 'ACTIVE' ? '결제일 순' : '해지일 순'}
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
                          cost={formatWon(tab === 'ACTIVE' ? s.amount : s.monthlyAmount)}
                          showCost
                          showCheckBox
                          checked={picked.includes(s.id)}
                          onCheckedChange={() => toggle(s.id)}
                        />
                      </Pressable>
                    ) : (
                      // 행 전체가 터치 영역 → 구독 상세 (상태에 따라 M-03 · M-05)
                      <ListItem
                        key={s.id}
                        title={s.name}
                        subtitle={s.subtitle}
                        showSubtitle
                        logo={LOGO}
                        showLogo
                        cost={formatWon(tab === 'ACTIVE' ? s.amount : s.monthlyAmount)}
                        showCost
                        iconRightAction={{
                          accessibilityLabel: `${s.name} 상세`,
                          onPress: () => router.push(`/manage/detail/${s.id}`),
                        }}
                      />
                    ),
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </>
      )}
      {/* 탭바(하단 안전 영역 + 4 + 52) 위 18에 + 버튼, 그 위 8에 토스트. 구독이 없으면 + 버튼 자리만 비움 */}
      <View pointerEvents="box-none" className="pb-safe absolute inset-x-0 bottom-0">
        <View pointerEvents="box-none">
          <ToastOutlet className="bottom-0 pb-stack-sm" />
        </View>
        <View pointerEvents="box-none" className="mb-[74px] items-end px-screen-x">
          {isEmpty ? (
            <View className="size-s48" />
          ) : (
            <FloatingButton
              accessibilityLabel="구독 추가"
              onPress={() => router.push('/register')}
            />
          )}
        </View>
      </View>
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
