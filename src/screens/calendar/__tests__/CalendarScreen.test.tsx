import { act, render, screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  createGestureController,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import { CalendarScreen } from '@/screens/calendar/CalendarScreen';

// 시트 애니메이션·제스처는 네이티브라 라이브러리 mock으로 내용만 렌더
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));

beforeEach(() => {
  jest.useFakeTimers();
  // 화면이 이번 달 기준이라 날짜 고정 (2026년 11월 12일)
  jest.setSystemTime(new Date(2026, 10, 12));
});
afterEach(() => jest.useRealTimers());

it('날짜를 누르면 그 날짜만 선택된다', async () => {
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '20' }));
  expect(screen.getByRole('button', { name: '20' })).toBeSelected();

  await user.press(screen.getByRole('button', { name: '21' }));
  expect(screen.getByRole('button', { name: '21' })).toBeSelected();
  expect(screen.getByRole('button', { name: '20' })).not.toBeSelected();
});

it('선택한 날짜가 상세 제목에 보이고 결제 없는 날은 결제 없음이 보인다', async () => {
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '20' }));
  expect(screen.getByText('11월 20일 (금)')).toBeOnTheScreen();
  expect(screen.getByText('결제 없음')).toBeOnTheScreen();
  expect(screen.getByText('결제 예정인 구독이 없어요')).toBeOnTheScreen();
});

it('오늘 버튼을 누르면 오늘 날짜가 다시 선택된다', async () => {
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '20' }));
  await user.press(screen.getByRole('button', { name: '오늘' }));
  expect(screen.getByRole('button', { name: /^12(\s|$)/ })).toBeSelected();
  expect(screen.getByText('2026년 11월')).toBeOnTheScreen();
});

it('오늘을 선택하면 빈 상태 문구 앞에 오늘은이 붙는다', async () => {
  jest.setSystemTime(new Date(2026, 10, 13)); // 샘플 결제가 없는 날
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });

  expect(screen.getByText('오늘은 결제 예정인 구독이 없어요')).toBeOnTheScreen();
});

it('4주로 끝나는 달은 4주만 그린다', async () => {
  // 2026년 2월: 1일이 일요일, 28일까지라 다른 달 날짜 칸이 없음
  jest.setSystemTime(new Date(2026, 1, 1));
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });

  expect(screen.getByText('2026년 2월')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: /^28(\s|$)/ })).toBeOnTheScreen();
  expect(screen.queryAllByRole('button', { name: /^\d+(\s|$)/ })).toHaveLength(28);
});

it('6주에 걸치는 달은 앞뒤 다른 달 날짜까지 6주를 그린다', async () => {
  // 2026년 8월: 1일이 토요일, 31일까지라 7월 26~31일·9월 1~5일이 함께 보임
  jest.setSystemTime(new Date(2026, 7, 1));
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });

  expect(screen.queryAllByRole('button', { name: /^\d+(\s|$)/ })).toHaveLength(42);
  expect(screen.getAllByRole('button', { name: '26' })[0]).toBeDisabled();
  expect(screen.getAllByRole('button', { name: '5' }).at(-1)).toBeDisabled();
});

it('날짜 영역을 왼쪽으로 밀면 다음 달, 오른쪽으로 밀면 이전 달, 짧게 밀면 그대로다', async () => {
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });
  const swipe = (translationX: number) => {
    const pan = createGestureController(getByGestureTestId('calendar-swipe'));
    pan.begin();
    pan.activate({ translationX });
    pan.end({ translationX });
    // 밀려나는 애니메이션이 끝나야 달이 바뀜
    jest.advanceTimersByTime(1000);
  };

  await act(() => swipe(-80));
  expect(screen.getByText('2026년 12월')).toBeOnTheScreen();

  await act(() => swipe(80));
  await act(() => swipe(80));
  expect(screen.getByText('2026년 10월')).toBeOnTheScreen();

  await act(() => swipe(-30));
  expect(screen.getByText('2026년 10월')).toBeOnTheScreen();
});

it('연월을 누르면 날짜 선택 시트가 뜨고 확인하면 고른 날짜로 이동한다', async () => {
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const pan = createGestureController(getByGestureTestId('calendar-swipe'));
  await act(() => {
    pan.begin();
    pan.activate({ translationX: -80 });
    pan.end({ translationX: -80 });
    jest.advanceTimersByTime(1000);
  });
  await user.press(screen.getByRole('button', { name: '2026년 12월' }));

  expect(screen.getByText('이동할 날짜를 선택해 주세요.')).toBeOnTheScreen();
  // 시트는 오늘(11월 12일)로 열림
  await user.press(screen.getByRole('button', { name: '확인' }));
  expect(screen.getByText('2026년 11월')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: /^12(\s|$)/ })).toBeSelected();
});

it('결제 있는 날을 누르면 건수·합계와 결제 목록이 보인다', async () => {
  await render(<CalendarScreen />, { wrapper: GestureHandlerRootView });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: /^17(\s|$)/ }));

  expect(screen.getByText('3건 · 57,400원')).toBeOnTheScreen();
  expect(screen.getByText('ChatGPT Plus')).toBeOnTheScreen();
  expect(screen.getByText('매월 · Google Play')).toBeOnTheScreen();
  expect(screen.getByText('29,000원')).toBeOnTheScreen();
  expect(screen.queryByText('결제 없음')).not.toBeOnTheScreen();
});

it('결제 목록 행을 누르면 그 결제 상세로 이동한다', async () => {
  await renderRouter(
    {
      index: () => (
        <GestureHandlerRootView>
          <CalendarScreen />
        </GestureHandlerRootView>
      ),
      'calendar/detail/[id]': () => null,
    },
    { initialUrl: '/' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: /^17(\s|$)/ }));
  await user.press(screen.getByRole('button', { name: '넷플릭스 상세' }));

  expect(screen).toHavePathname('/calendar/detail/netflix');
});
