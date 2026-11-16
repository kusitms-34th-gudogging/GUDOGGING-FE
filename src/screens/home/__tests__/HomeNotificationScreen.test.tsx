import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { AppNotification } from '@/constants/notification';
import { useNotifications } from '@/hooks/useNotifications';
import { HomeNotificationScreen } from '@/screens/home/HomeNotificationScreen';

const NOW = new Date(2026, 10, 17, 15); // 11월 17일 15:00
const LOGO = { uri: 'logo' };
const note = (over: Partial<AppNotification> & { id: string }): AppNotification => ({
  kind: 'payment',
  subscriptionId: over.id,
  title: over.id,
  description: '',
  logo: LOGO,
  receivedAt: new Date(2026, 10, 17, 14),
  read: false,
  ...over,
});

const renderList = async (notifications: AppNotification[]) => {
  useNotifications.setState({ notifications });
  await renderRouter(
    {
      index: () => <HomeNotificationScreen />,
      'checkup/[id]/index': () => null,
      'manage/detail/[id]': () => null,
    },
    { initialUrl: '/' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});
afterEach(() => jest.useRealTimers());

describe('HomeNotificationScreen', () => {
  it('알림이 없으면 빈 상태를 보여 준다', async () => {
    await renderList([]);

    expect(screen.getByText('아직 받은 알림이 없어요')).toBeOnTheScreen();
  });

  it('30일 안 알림만 오늘·이전 알림으로 나눠 받은 시간과 함께 보여 준다', async () => {
    await renderList([
      note({ id: '오늘 알림', receivedAt: new Date(2026, 10, 17, 14) }),
      note({ id: '지난 알림', receivedAt: new Date(2026, 10, 14, 9) }),
      note({ id: '오래된 알림', receivedAt: new Date(2026, 9, 1) }),
    ]);

    expect(screen.getByRole('header', { name: '오늘' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: '이전 알림' })).toBeOnTheScreen();
    expect(screen.getByText('1시간 전')).toBeOnTheScreen();
    expect(screen.getByText('11월 14일')).toBeOnTheScreen();
    expect(screen.queryByText('오래된 알림')).not.toBeOnTheScreen();
  });

  it.each([
    ['checkup', '/checkup/netflix', { id: 'netflix', restart: '1' }],
    ['payment', '/manage/detail/netflix', { id: 'netflix' }],
    ['cancel-confirm', '/manage/detail/netflix', { id: 'netflix', confirmCancel: '1' }],
  ] as const)('%s 알림을 누르면 읽음 처리하고 정해진 화면으로 간다', async (kind, path, params) => {
    const user = await renderList([note({ id: 'n', kind, subscriptionId: 'netflix' })]);

    await user.press(screen.getByRole('button', { name: /^n/ }));

    expect(screen).toHavePathname(path);
    expect(screen).toHaveSearchParams(params);
    expect(useNotifications.getState().notifications[0].read).toBe(true);
  });
});
