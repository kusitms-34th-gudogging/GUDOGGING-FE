import { userEvent } from '@testing-library/react-native';
import { useScrollToTop } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import TabsLayout from '@/app/(tabs)/_layout';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('탭을 누르면 해당 탭 경로로 이동하고 선택 상태가 바뀐다', async () => {
  await renderRouter(
    {
      '(tabs)/_layout': TabsLayout,
      '(tabs)/index': () => null,
      '(tabs)/calendar': () => null,
      '(tabs)/manage': () => null,
      '(tabs)/mypage': () => null,
    },
    { initialUrl: '/' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('tab', { name: '구독 관리' }));
  expect(screen).toHavePathname('/manage');
  expect(screen.getByRole('tab', { name: '구독 관리' })).toBeSelected();

  await user.press(screen.getByRole('tab', { name: '홈' }));
  expect(screen).toHavePathname('/');
});

it('현재 탭을 다시 누를 때만 그 화면을 맨 위로 스크롤한다', async () => {
  const scrollTo = jest.fn();
  const HomeTab = () => {
    useScrollToTop({ current: { scrollTo } });
    return null;
  };
  await renderRouter(
    {
      '(tabs)/_layout': TabsLayout,
      '(tabs)/index': HomeTab,
      '(tabs)/calendar': () => null,
      '(tabs)/manage': () => null,
      '(tabs)/mypage': () => null,
    },
    { initialUrl: '/' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('tab', { name: '홈' }));
  jest.runOnlyPendingTimers();
  expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });

  scrollTo.mockClear();
  await user.press(screen.getByRole('tab', { name: '캘린더' }));
  jest.runOnlyPendingTimers();
  expect(scrollTo).not.toHaveBeenCalled();
});
