import { userEvent } from '@testing-library/react-native';
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
      '(tabs)/subscription': () => null,
      '(tabs)/mypage': () => null,
    },
    { initialUrl: '/' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('tab', { name: '구독 관리' }));
  expect(screen).toHavePathname('/subscription');
  expect(screen.getByRole('tab', { name: '구독 관리' })).toBeSelected();

  await user.press(screen.getByRole('tab', { name: '홈' }));
  expect(screen).toHavePathname('/');
});
