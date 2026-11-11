import { motion } from '@tokens';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { CalendarDay } from '@/components/calendar/CalendarDay';
import { CalendarWeekday } from '@/components/calendar/CalendarWeekday';
import { Badge } from '@/components/common/Badge';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { Dial } from '@/components/common/Dial';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import { CALENDAR_SAMPLE, type CalendarPayment } from '@/constants/calendar';
import { PAID_AT } from '@/constants/services';
import { cn } from '@/utils/cn';
import { formatCycle, formatWon } from '@/utils/formatPayment';

// 날짜(일)별 결제
const SAMPLE = CALENDAR_SAMPLE.reduce<Record<number, CalendarPayment[]>>((byDay, p) => {
  (byDay[p.day] ??= []).push(p);
  return byDay;
}, {});
const MONTH_TOTAL = Object.values(SAMPLE)
  .flat()
  .reduce((sum, p) => sum + p.amount, 0);

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const SWIPE_DISTANCE = 50;
// 날짜 칸 높이 72 × 주 수. 옆 달을 겹쳐 두려고 칸들을 absolute로 놓아서 높이를 직접 줌
const GRID_HEIGHT: Record<number, string> = { 4: 'h-[288px]', 5: 'h-[360px]', 6: 'h-[432px]' };

// 달을 이어진 번호(page)로 다뤄서 스와이프 위치를 page × 화면 폭으로 계산
const pageOf = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const monthOf = (page: number) => new Date(Math.floor(page / 12), page % 12, 1);

// 이번 달 1일이 든 주의 일요일부터 이번 달이 끝나는 주까지
const monthCells = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from(
    { length: Math.ceil((first.getDay() + days) / 7) * 7 },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1 - first.getDay()),
  );
};

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

interface MonthPanelProps {
  page: number;
  offset: SharedValue<number>;
  width: number;
  current: boolean;
  today: Date;
  selected: Date;
  onSelect: (date: Date) => void;
}

// 한 달 날짜 칸. 자기 page 자리(page × 폭)에 고정돼 있고 offset만큼 같이 밀림
const MonthPanel = ({
  page,
  offset,
  width,
  current,
  today,
  selected,
  onSelect,
}: MonthPanelProps) => {
  const month = monthOf(page);
  const cells = monthCells(month);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: page * width + offset.get() }],
  }));

  return (
    <Animated.View
      style={style}
      accessibilityElementsHidden={!current}
      importantForAccessibility={current ? 'auto' : 'no-hide-descendants'}
      className={cn('absolute inset-x-0 top-0 px-[6px]', !current && 'pointer-events-none')}
    >
      {Array.from({ length: cells.length / 7 }, (_, w) => (
        <View key={w} className="flex-row gap-px">
          {cells.slice(w * 7, w * 7 + 7).map((d) => {
            const inMonth = d.getMonth() === month.getMonth();
            return (
              <CalendarDay
                key={d.toISOString()}
                date={d.getDate()}
                subscriptions={SAMPLE[d.getDate()]}
                today={sameDay(d, today)}
                selected={inMonth && sameDay(d, selected)}
                disabled={!inMonth}
                onPress={() => onSelect(d)}
                className="flex-1"
              />
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
};

// C-01 캘린더 (월별 결제 일정)
export const CalendarScreen = () => {
  const today = new Date();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(() => pageOf(today));
  const [selected, setSelected] = useState(today);
  const month = monthOf(page);
  const weeks = monthCells(month).length / 7;
  const payments = SAMPLE[selected.getDate()] ?? [];

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
            if (finished) scheduleOnRN(setPage, from + dir);
          },
        ),
      );
    },
  });

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar title="캘린더" showAction1={false} showAction2={false} />
      <ScrollView contentContainerClassName="pb-[120px] pt-s12">
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
            <Badge variant="tonal" label={`이번 달 결제 합계 ${formatWon(MONTH_TOTAL)}`} />
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
              {[page - 1, page, page + 1].map((p) => (
                <MonthPanel
                  key={p}
                  page={p}
                  offset={offset}
                  width={width}
                  current={p === page}
                  today={today}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </View>
          </View>
        </GestureDetector>

        <View className={cn('mt-s20 px-screen-x', payments.length ? 'gap-stack-md' : 'gap-s8')}>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary text-head4-bold">
              {selected.getMonth() + 1}월 {selected.getDate()}일 ({WEEKDAYS[selected.getDay()]})
            </Text>
            <Text className="text-text-secondary text-body3-regular">
              {payments.length
                ? `${payments.length}건 · ${formatWon(payments.reduce((sum, p) => sum + p.amount, 0))}`
                : '결제 없음'}
            </Text>
          </View>
          {payments.length ? (
            <View className="gap-stack-sm">
              {payments.map((p) => (
                <ListItem
                  key={p.id}
                  title={p.name}
                  subtitle={`${formatCycle(p.cycle, p.unit)} · ${PAID_AT.find((a) => a.value === p.paidAt)?.label}`}
                  showSubtitle
                  logo={p.logo}
                  showLogo
                  cost={formatWon(p.amount)}
                  showCost
                  iconRightAction={{
                    accessibilityLabel: `${p.name} 상세`,
                    onPress: () => router.push(`/calendar/detail/${p.id}`),
                  }}
                />
              ))}
            </View>
          ) : (
            <Text className="text-text-tertiary text-body2-regular">
              {sameDay(selected, today) && '오늘은 '}결제 예정인 구독이 없어요
            </Text>
          )}
        </View>
      </ScrollView>
      <BottomSheet
        visible={dateSheet}
        onClose={() => setDateSheet(false)}
        title="이동할 날짜를 선택해 주세요."
        confirmLabel="확인"
        onConfirm={() => goTo(draftDate)}
      >
        {/* shortcut: 지난 달도 볼 수 있게 앞뒤 10년, 범위가 정해지면 맞춤 */}
        <Dial
          value={draftDate}
          onValueChange={setDraftDate}
          minYear={today.getFullYear() - 10}
          maxYear={today.getFullYear() + 10}
        />
      </BottomSheet>
    </View>
  );
};
