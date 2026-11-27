import { act, screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  createGestureController,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import { createQueryWrapper } from '@/lib/testing';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';

// 시트 애니메이션·제스처는 네이티브라 라이브러리 mock으로 내용만 렌더
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));

const pay = (id: string, name: string, amount: number, paymentMethod = 'APP_STORE') => ({
  subscriptionId: id,
  serviceName: name,
  logoUrl: null,
  amount,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  paymentMethod,
});
// 월별 응답. 없는 달은 결제 없음
const MONTHS: Record<string, object[]> = {
  '2026-11': [
    {
      date: '2026-11-17',
      totalAmount: 57400,
      payments: [
        pay('chatgpt', 'ChatGPT Plus', 29000, 'GOOGLE_PLAY'),
        pay('netflix', '넷플릭스', 13500),
        pay('youtube', '유튜브 프리미엄', 14900),
      ],
    },
  ],
  '2026-12': [
    { date: '2026-12-08', totalAmount: 9900, payments: [pay('millie', '밀리의 서재', 9900)] },
  ],
};

let failing = false;
const mockCalendar = () =>
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    if (failing) return new Response(JSON.stringify({ code: 500, data: null }), { status: 500 });
    const params = new URL(String(input)).searchParams;
    const key = `${params.get('year')}-${params.get('month')?.padStart(2, '0')}`;
    const data = {
      currentMonthTotal: 142400,
      days: MONTHS[key] ?? [],
    };
    return new Response(JSON.stringify({ code: 200, data }));
  });

const Providers = () => {
  const QueryWrapper = createQueryWrapper();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryWrapper>
      <GestureHandlerRootView>{children}</GestureHandlerRootView>
    </QueryWrapper>
  );
  return Wrapper;
};

const renderCalendar = async () => {
  await renderRouter({ index: CalendarScreen }, { initialUrl: '/', wrapper: Providers() });
  // 이번 달 응답이 와야 배지가 보임
  await screen.findByText(/이번 달 결제 합계/);
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

const swipe = (translationX: number) => {
  const pan = createGestureController(getByGestureTestId('calendar-swipe'));
  pan.begin();
  pan.activate({ translationX });
  pan.end({ translationX });
  // 밀려나는 애니메이션이 끝나야 달이 바뀜
  jest.advanceTimersByTime(1000);
};

beforeEach(() => {
  jest.useFakeTimers();
  // 화면이 이번 달 기준이라 날짜 고정 (2026년 11월 12일)
  jest.setSystemTime(new Date(2026, 10, 12));
  failing = false;
  mockCalendar();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('불러오는 동안엔 결제 없음 대신 로딩을 보여 준다', async () => {
  jest.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));
  await renderRouter({ index: CalendarScreen }, { initialUrl: '/', wrapper: Providers() });

  expect(screen.getByLabelText('불러오는 중')).toBeOnTheScreen();
  expect(screen.queryByText('결제 없음')).not.toBeOnTheScreen();
  expect(screen.queryByText(/결제 예정인 구독이 없어요/)).not.toBeOnTheScreen();
});

it('날짜를 누르면 그 날짜만 선택된다', async () => {
  const user = await renderCalendar();

  await user.press(screen.getByRole('button', { name: '20' }));
  expect(screen.getByRole('button', { name: '20' })).toBeSelected();

  await user.press(screen.getByRole('button', { name: '21' }));
  expect(screen.getByRole('button', { name: '21' })).toBeSelected();
  expect(screen.getByRole('button', { name: '20' })).not.toBeSelected();
});

it('선택한 날짜가 상세 제목에 보이고 결제 없는 날은 결제 없음이 보인다', async () => {
  const user = await renderCalendar();

  await user.press(screen.getByRole('button', { name: '20' }));
  expect(screen.getByText('11월 20일 (금)')).toBeOnTheScreen();
  expect(screen.getByText('결제 없음')).toBeOnTheScreen();
  expect(screen.getByText('결제 예정인 구독이 없어요')).toBeOnTheScreen();
});

it('오늘 버튼을 누르면 오늘 날짜가 다시 선택된다', async () => {
  const user = await renderCalendar();

  await user.press(screen.getByRole('button', { name: '20' }));
  await user.press(screen.getByRole('button', { name: '오늘' }));
  expect(screen.getByRole('button', { name: /^12(\s|$)/ })).toBeSelected();
  expect(screen.getByText('2026년 11월')).toBeOnTheScreen();
});

it('오늘을 선택하면 빈 상태 문구 앞에 오늘은이 붙는다', async () => {
  await renderCalendar();

  expect(screen.getByText('오늘은 결제 예정인 구독이 없어요')).toBeOnTheScreen();
});

it('4주로 끝나는 달은 4주만 그린다', async () => {
  // 2026년 2월: 1일이 일요일, 28일까지라 다른 달 날짜 칸이 없음
  jest.setSystemTime(new Date(2026, 1, 1));
  await renderCalendar();

  expect(screen.getByText('2026년 2월')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: /^28(\s|$)/ })).toBeOnTheScreen();
  expect(screen.queryAllByRole('button', { name: /^\d+(\s|$)/ })).toHaveLength(28);
});

it('6주에 걸치는 달은 앞뒤 다른 달 날짜까지 6주를 그린다', async () => {
  // 2026년 8월: 1일이 토요일, 31일까지라 7월 26~31일·9월 1~5일이 함께 보임
  jest.setSystemTime(new Date(2026, 7, 1));
  await renderCalendar();

  expect(screen.queryAllByRole('button', { name: /^\d+(\s|$)/ })).toHaveLength(42);
  expect(screen.getAllByRole('button', { name: '26' })[0]).toBeDisabled();
  expect(screen.getAllByRole('button', { name: '5' }).at(-1)).toBeDisabled();
});

it('날짜 영역을 왼쪽으로 밀면 다음 달, 오른쪽으로 밀면 이전 달, 짧게 밀면 그대로다', async () => {
  await renderCalendar();

  await act(() => swipe(-80));
  expect(screen.getByText('2026년 12월')).toBeOnTheScreen();

  await act(() => swipe(80));
  await act(() => swipe(80));
  expect(screen.getByText('2026년 10월')).toBeOnTheScreen();

  await act(() => swipe(-30));
  expect(screen.getByText('2026년 10월')).toBeOnTheScreen();
});

it('연월을 누르면 날짜 선택 시트가 뜨고 확인하면 고른 날짜로 이동한다', async () => {
  const user = await renderCalendar();
  await act(() => swipe(-80));
  await user.press(screen.getByRole('button', { name: '2026년 12월' }));

  expect(screen.getByText('이동할 날짜를 선택해 주세요.')).toBeOnTheScreen();
  // 시트는 오늘(11월 12일)로 열림
  await user.press(screen.getByRole('button', { name: '확인' }));
  expect(screen.getByText('2026년 11월')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: /^12(\s|$)/ })).toBeSelected();
});

it('결제 있는 날을 누르면 건수·합계와 결제 목록이 보인다', async () => {
  const user = await renderCalendar();

  await user.press(screen.getByRole('button', { name: /^17(\s|$)/ }));

  expect(screen.getByText('3건 · 57,400원')).toBeOnTheScreen();
  expect(screen.getByText('ChatGPT Plus')).toBeOnTheScreen();
  expect(screen.getByText('매월 · Google Play')).toBeOnTheScreen();
  expect(screen.getByText('29,000원')).toBeOnTheScreen();
  expect(screen.queryByText('결제 없음')).not.toBeOnTheScreen();
});

it('다른 달로 가면 그 달 결제를 불러와 보여 준다', async () => {
  const user = await renderCalendar();

  await act(() => swipe(-80));
  await user.press(screen.getByRole('button', { name: /^8(\s|$)/ }));

  expect(await screen.findByText('밀리의 서재')).toBeOnTheScreen();
  expect(jest.mocked(globalThis.fetch).mock.calls.map(([url]) => String(url))).toContainEqual(
    expect.stringContaining('year=2026&month=12'),
  );
});

it('결제 목록 행을 누르면 그 결제 상세로 이동한다', async () => {
  await renderRouter(
    {
      index: () => <CalendarScreen />,
      'calendar/detail/[id]': () => null,
    },
    { initialUrl: '/', wrapper: Providers() },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(await screen.findByRole('button', { name: /^17(\s|$)/ }));
  await user.press(screen.getByRole('button', { name: '넷플릭스 상세' }));

  expect(screen).toHavePathname('/calendar/detail/netflix');
  // 상세가 고른 날짜 기준으로 다음 결제일을 받도록 날짜를 넘김
  expect(screen).toHaveSearchParams({ id: 'netflix', date: '2026-11-17' });
});

it('스와이프로 다른 달에 가면 1일이 선택되고, 결제 합계 배지는 응답의 이번 달 합계다', async () => {
  await renderCalendar();
  expect(screen.getByText('이번 달 결제 합계 142,400원')).toBeOnTheScreen();

  await act(() => swipe(80));

  expect(screen.getByText('2026년 10월')).toBeOnTheScreen();
  expect(screen.getByText('10월 1일 (목)')).toBeOnTheScreen();
  expect(await screen.findByText('이번 달 결제 합계 142,400원')).toBeOnTheScreen();
});

it('불러오지 못하면 다시 시도로 다시 요청한다', async () => {
  failing = true;
  await renderRouter({ index: CalendarScreen }, { initialUrl: '/', wrapper: Providers() });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  failing = false;
  await user.press(await screen.findByRole('button', { name: '다시 시도' }));

  expect(await screen.findByText('이번 달 결제 합계 142,400원')).toBeOnTheScreen();
});
