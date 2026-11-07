import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { RegisterFailedScreen } from '@/screens/RegisterFailedScreen';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('직접 등록하기를 누르면 서비스 선택(A-02)으로 이동한다', async () => {
  await renderRouter(
    { 'register/failed': RegisterFailedScreen, 'register/select': () => null },
    { initialUrl: '/register/failed' },
  );

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '직접 등록하기' }));

  expect(screen).toHavePathname('/register/select');
});
