import { render, screen, userEvent } from '@testing-library/react-native';

import { CalendarScreen } from '@/screens/calendar/CalendarScreen';

beforeEach(() => {
  jest.useFakeTimers();
  // 화면이 이번 달 기준이라 날짜 고정 (2026년 11월 12일)
  jest.setSystemTime(new Date(2026, 10, 12));
});
afterEach(() => jest.useRealTimers());

it('날짜를 누르면 그 날짜만 선택된다', async () => {
  await render(<CalendarScreen />);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '20' }));
  expect(screen.getByRole('button', { name: '20' })).toBeSelected();

  await user.press(screen.getByRole('button', { name: '21' }));
  expect(screen.getByRole('button', { name: '21' })).toBeSelected();
  expect(screen.getByRole('button', { name: '20' })).not.toBeSelected();
});
