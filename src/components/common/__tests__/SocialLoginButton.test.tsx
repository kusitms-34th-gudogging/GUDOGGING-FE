import { render, screen, userEvent } from '@testing-library/react-native';

import { SocialLoginButton } from '@/components/common/SocialLoginButton';

describe('SocialLoginButton', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('apple이면 "Apple로 로그인"이 보인다', async () => {
    await render(<SocialLoginButton provider="apple" />);

    expect(screen.getByRole('button', { name: 'Apple로 로그인' })).toBeOnTheScreen();
  });

  it('google이면 "Google 계정으로 로그인"이 보인다', async () => {
    await render(<SocialLoginButton provider="google" />);

    expect(screen.getByRole('button', { name: 'Google 계정으로 로그인' })).toBeOnTheScreen();
  });

  it('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<SocialLoginButton provider="apple" onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: 'Apple로 로그인' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
