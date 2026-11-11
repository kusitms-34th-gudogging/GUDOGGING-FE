import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen as routerScreen } from 'expo-router/testing-library';

import { CALENDAR_SAMPLE } from '@/constants/calendar';
import { CalendarDetailScreen } from '@/screens/calendar/CalendarDetailScreen';

const find = (id: string) => CALENDAR_SAMPLE.find((p) => p.id === id)!;

beforeEach(() => {
  jest.useFakeTimers();
  // 다음 결제일이 오늘 기준이라 날짜 고정 (2026년 11월 12일)
  jest.setSystemTime(new Date(2026, 10, 12));
});
afterEach(() => jest.useRealTimers());

it('결제 금액·연 환산과 결제 정보를 보여준다', async () => {
  await render(<CalendarDetailScreen payment={find('netflix')} />);

  expect(screen.getByText('13,500원')).toBeOnTheScreen();
  expect(screen.getByText('연 환산 162,000원')).toBeOnTheScreen();
  // 매달 17일 결제라 오늘(11월 12일) 다음 결제일은 11월 17일
  expect(screen.getByText('11월 17일')).toBeOnTheScreen();
  expect(screen.getByText('App Store')).toBeOnTheScreen();
  expect(screen.getByText('2026년 7월 17일')).toBeOnTheScreen();
});

it('최근 점검이 있으면 점검 결과와 메모를 보여준다', async () => {
  await render(<CalendarDetailScreen payment={find('netflix')} />);

  expect(screen.getByText('10월 3일 점검')).toBeOnTheScreen();
  expect(screen.getByText('유지 추천(92%)')).toBeOnTheScreen();
  expect(screen.getByDisplayValue('시즌 3 공개돼서 이번 달은 유지할 생각임')).toBeOnTheScreen();
});

it('최근 점검이 없으면 점검 영역이 없다', async () => {
  await render(<CalendarDetailScreen payment={find('youtube')} />);

  expect(screen.queryByText('최근 점검')).not.toBeOnTheScreen();
});

it('더보기를 누르면 편집·삭제 메뉴가 보인다', async () => {
  await render(<CalendarDetailScreen payment={find('netflix')} />);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '더보기' }));

  expect(screen.getByText('편집')).toBeOnTheScreen();
  expect(screen.getByText('삭제')).toBeOnTheScreen();
});

it('삭제를 누르면 확인 모달이 뜨고, 취소하면 그대로 남는다', async () => {
  await render(<CalendarDetailScreen payment={find('netflix')} />);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '더보기' }));
  await user.press(screen.getByText('삭제'));
  // 받침 없는 이름은 '를'
  expect(screen.getByText('넷플릭스를 삭제할까요?')).toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: '취소' }));
  expect(screen.queryByText('넷플릭스를 삭제할까요?')).not.toBeOnTheScreen();
});

it('삭제하기를 누르면 캘린더로 돌아간다', async () => {
  await renderRouter(
    {
      index: () => null,
      'calendar/detail/[id]': () => <CalendarDetailScreen payment={find('melon')} />,
    },
    { initialUrl: '/' },
  );
  await act(() => router.push('/calendar/detail/melon'));
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(routerScreen.getByRole('button', { name: '더보기' }));
  await user.press(routerScreen.getByText('삭제'));
  // 받침 있는 이름은 '을'
  expect(routerScreen.getByText('멜론을 삭제할까요?')).toBeOnTheScreen();
  await user.press(routerScreen.getByRole('button', { name: '삭제하기' }));

  expect(routerScreen).toHavePathname('/');
});
