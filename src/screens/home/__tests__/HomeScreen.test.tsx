import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { HomeScreen } from '@/screens/home/HomeScreen';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('HomeScreen', () => {
  it('등록된 구독이 없으면 빈 상태를 보여 주고, 구독 등록하기로 구독 추가에 간다', async () => {
    await renderRouter(
      { index: () => <HomeScreen subscriptions={[]} />, 'register/index': () => null },
      { initialUrl: '/' },
    );

    expect(screen.getByText('아직 등록된 구독이 없어요')).toBeOnTheScreen();
    expect(screen.queryByText('다가오는 결제')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '구독 추가' })).not.toBeOnTheScreen();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '구독 등록하기' }));

    expect(screen).toHavePathname('/register');
  });

  it('구독이 있으면 결제 목록과 추가 버튼을 보여 준다', async () => {
    await renderRouter(
      {
        index: () => <HomeScreen subscriptions={[{ id: 'a', nextDate: new Date(2026, 9, 17) }]} />,
      },
      { initialUrl: '/' },
    );

    expect(screen.getByText('다가오는 결제')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '구독 추가' })).toBeOnTheScreen();
    expect(screen.queryByText('아직 등록된 구독이 없어요')).not.toBeOnTheScreen();
  });
});
