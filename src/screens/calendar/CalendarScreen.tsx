import { motion } from '@tokens';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { CalendarMonthPanel } from '@/components/calendar/CalendarMonthPanel';
import { CalendarWeekday } from '@/components/calendar/CalendarWeekday';
import { Badge } from '@/components/common/Badge';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { Dial } from '@/components/common/Dial';
import { ListItem } from '@/components/common/ListItem';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { PAID_AT } from '@/constants/services';
import { type CalendarItem, useCalendar } from '@/hooks/useCalendar';
import { useRowSnap } from '@/hooks/useRowSnap';
import { cn } from '@/utils/cn';
import { formatDate, monthCells, monthOf, pageOf, sameDay } from '@/utils/date';
import { formatCycle, formatWon } from '@/utils/formatPayment';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const SWIPE_DISTANCE = 50;
// 날짜 칸 높이 72 × 주 수. 옆 달을 겹쳐 두려고 칸들을 absolute로 놓아서 높이를 직접 줌
const GRID_HEIGHT: Record<number, string> = { 4: 'h-[288px]', 5: 'h-[360px]', 6: 'h-[432px]' };

const sumOf = (list: CalendarItem[]) => list.reduce((sum, p) => sum + p.amount, 0);
// 달마다 캘린더 API 한 번 (month는 1~12)
const useMonth = (page: number) => {
  const month = monthOf(page);
  return useCalendar(month.getFullYear(), month.getMonth() + 1);
};

// C-01 캘린더 (월별 결제 일정)
export const CalendarScreen = () => {
  const today = new Date();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(() => pageOf(today));
  const [selected, setSelected] = useState(today);
  const month = monthOf(page);
  const weeks = monthCells(month).length / 7;
  // 옆 달도 미리 그려 두려고 이전·다음 달까지 조회
  const prev = useMonth(page - 1);
  const current = useMonth(page);
  const next = useMonth(page + 1);
  const payments = current.data?.byDate.get(formatDate(selected)) ?? [];

  const snap = useRowSnap(payments.length);

  // 이전·현재·다음 달을 나란히 두고 같이 미는 방식 (Swiper). 놓으면 옆 달이 바로 따라 들어와 빈 화면이 없음
  // 이미 그려진 달은 자리가 안 바뀌고 offset만 움직여서, 달이 바뀌는 순간에도 깜빡이지 않음
  const offset = useSharedValue(-page * width);
  const start = useSharedValue(0);

  // 오늘 버튼·화면 폭 변경처럼 스와이프가 아닌 이유로 page가 바뀌면 그 자리로 바로 이동
  useEffect(() => {
    if (Math.round(-offset.get() / width) !== page) offset.set(-page * width);
  }, [page, width, offset]);

  const goTo = (date: Date) => {
    setPage(pageOf(date));
    setSelected(date);
  };

  // 스와이프로 다른 달에 가면 1일 선택, 오늘이 속한 달로 돌아오면 오늘 선택 (CAL-002)
  const moveToPage = (p: number) => {
    setPage(p);
    setSelected(p === pageOf(today) ? today : monthOf(p));
  };

  // 연월 제목을 누르면 날짜 선택 시트. 열 때마다 오늘부터 고름 (Figma C-01 연월 클릭시)
  const [dateSheet, setDateSheet] = useState(false);
  const [draftDate, setDraftDate] = useState(today);
  const openDateSheet = () => {
    setDraftDate(new Date());
    setDateSheet(true);
  };

  // 가로 10 넘게 움직이면 시작, 세로로 먼저 움직이면 포기해서 세로 스크롤·날짜 탭은 그대로 둠
  const swipe = usePanGesture({
    testID: 'calendar-swipe',
    activeOffsetX: [-10, 10],
    failOffsetY: [-10, 10],
    enableTrackpadTwoFingerGesture: true,
    onActivate: () => {
      'worklet';
      start.set(offset.get());
    },
    onUpdate: (e) => {
      'worklet';
      offset.set(start.get() + e.translationX);
    },
    onDeactivate: (e) => {
      'worklet';
      const from = Math.round(-start.get() / width);
      const dir = Math.abs(e.translationX) < SWIPE_DISTANCE ? 0 : e.translationX < 0 ? 1 : -1;
      offset.set(
        withTiming(
          -(from + dir) * width,
          { duration: motion.transition, easing: Easing.bezier(...motion['ease-move']) },
          (finished) => {
            if (finished && dir) scheduleOnRN(moveToPage, from + dir);
          },
        ),
      );
    },
  });

  return (
    <View className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar title="캘린더" showAction1={false} showAction2={false} />
      {/* 스크롤 영역을 떠 있는 탭바(52 + 아래 4) + 최소 간격 12 위에서 끝내서, 어느 기기에서도 행이 탭바에 닿거나 겹쳐 보이지 않게
          iOS 기본 튕김(bounce)으로 끝에서 화면이 당겨지지 않게 */}
      <Animated.View
        onLayout={snap.onViewportLayout}
        className="mb-[68px] flex-1"
        style={snap.hiddenStyle}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-s20 pt-s12"
          snapToOffsets={snap.snapOffsets}
        >
          <View className="flex-row items-center justify-between px-screen-x">
            <View className="items-start gap-s2">
              <Pressable
                accessibilityRole="button"
                accessibilityHint="이동할 날짜를 선택해요"
                onPress={openDateSheet}
                className="active:opacity-pressed"
              >
                <Text className="pl-[2px] text-text-primary text-head3-bold">
                  {month.getFullYear()}년 {month.getMonth() + 1}월
                </Text>
              </Pressable>
              {/* 오늘이 속한 달 합계라 어느 달 응답이든 같음 (CAL-001) */}
              {current.data && (
                <Badge
                  variant="tonal"
                  label={`이번 달 결제 합계 ${formatWon(current.data.currentMonthTotal)}`}
                />
              )}
            </View>
            <View className="pr-s4">
              <Button variant="tonal" size="sm" label="오늘" onPress={() => goTo(today)} />
            </View>
          </View>

          <GestureDetector gesture={swipe}>
            <View className="mt-s20 gap-s8">
              <View className="px-[6px]">
                <CalendarWeekday />
              </View>
              <View className={cn('overflow-hidden', GRID_HEIGHT[weeks])}>
                {[prev, current, next].map((q, i) => (
                  <CalendarMonthPanel
                    key={page - 1 + i}
                    page={page - 1 + i}
                    offset={offset}
                    width={width}
                    current={i === 1}
                    today={today}
                    selected={selected}
                    byDate={q.data?.byDate}
                    onSelect={setSelected}
                  />
                ))}
              </View>
            </View>
          </GestureDetector>

          <View
            onLayout={snap.onSectionLayout}
            className={cn('mt-s20 px-screen-x', payments.length ? 'gap-stack-md' : 'gap-s8')}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-text-primary text-head4-bold">
                {selected.getMonth() + 1}월 {selected.getDate()}일 ({WEEKDAYS[selected.getDay()]})
              </Text>
              <Text className="text-text-secondary text-body3-regular">
                {payments.length
                  ? `${payments.length}건 · ${formatWon(sumOf(payments))}`
                  : '결제 없음'}
              </Text>
            </View>
            {current.isError ? (
              <QueryState isError onRetry={current.refetch} />
            ) : payments.length ? (
              <View onLayout={snap.onListLayout} className="gap-stack-sm">
                {payments.map((p, i) => (
                  <View key={p.id} onLayout={snap.onRowLayout(i)}>
                    <ListItem
                      title={p.name}
                      subtitle={`${formatCycle(p.cycle, p.unit)} · ${PAID_AT.find((a) => a.value === p.paidAt)?.label}`}
                      showSubtitle
                      logo={p.logo}
                      showLogo
                      cost={formatWon(p.amount)}
                      showCost
                      iconRightAction={{
                        accessibilityLabel: `${p.name} 상세`,
                        onPress: () =>
                          router.push(`/calendar/detail/${p.id}?date=${formatDate(selected)}`),
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-text-tertiary text-body2-regular">
                {sameDay(selected, today) && '오늘은 '}결제 예정인 구독이 없어요
              </Text>
            )}
          </View>
        </ScrollView>
      </Animated.View>
      {/* 상세에서 삭제(S-2) 후 돌아오면 토스트. 탭바(하단 안전 영역 + 4 + 52) 위 12, 구독 관리와 같음 */}
      <ToastOutlet placement="bottom" />
      <BottomSheet
        visible={dateSheet}
        onClose={() => setDateSheet(false)}
        title="이동할 날짜를 선택해 주세요."
        confirmLabel="확인"
        onConfirm={() => goTo(draftDate)}
      >
        {/* 선택 가능한 연도 2024~2028 (CAL-001 바텀시트) */}
        <Dial value={draftDate} onValueChange={setDraftDate} minYear={2024} maxYear={2028} />
      </BottomSheet>
    </View>
  );
};
