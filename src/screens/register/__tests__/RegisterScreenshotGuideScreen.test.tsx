import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Linking } from 'react-native';

import { RegisterScreenshotGuideScreen } from '@/screens/register/RegisterScreenshotGuideScreen';

const renderGuide = async () => {
  await renderRouter(
    {
      'register/screenshot': () => <RegisterScreenshotGuideScreen />,
      'register/images': () => null,
    },
    { initialUrl: '/register/screenshot' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('RegisterScreenshotGuideScreen', () => {
  it('구독 관리 화면을 열 수 없으면 버튼을 그대로 둔다', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('cannot open'));
    const user = await renderGuide();

    await user.press(screen.getByRole('button', { name: '스크린샷 찍으러 가기' }));

    expect(screen.queryByRole('button', { name: '스크린샷 등록하기' })).not.toBeOnTheScreen();
  });

  it('구독 관리 화면을 열고 오면 스크린샷 등록으로 갈 수 있다', async () => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue();
    const user = await renderGuide();

    await user.press(screen.getByRole('button', { name: '스크린샷 찍으러 가기' }));
    await user.press(screen.getByRole('button', { name: '스크린샷 등록하기' }));

    expect(screen).toHavePathname('/register/images');
  });
});
