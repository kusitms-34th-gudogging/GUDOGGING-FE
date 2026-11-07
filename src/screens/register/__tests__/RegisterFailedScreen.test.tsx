import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { RegisterFailedScreen } from '@/screens/register/RegisterFailedScreen';

// 배경 블러는 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 화면 동작과 무관)
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Circle: () => null,
  Blur: () => null,
  LinearGradient: () => null,
  vec: (x: number, y: number) => ({ x, y }),
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('직접 등록하기를 누르면 서비스 선택(A-02)으로 이동한다', async () => {
  await renderRouter(
    {
      'register/failed': () => <RegisterFailedScreen source="screenshot" />,
      'register/select': () => null,
    },
    { initialUrl: '/register/failed' },
  );

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '직접 등록하기' }));

  expect(screen).toHavePathname('/register/select');
});
