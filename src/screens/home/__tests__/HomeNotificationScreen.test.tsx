import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { HomeNotificationScreen } from '@/screens/home/HomeNotificationScreen';

const NOW = new Date(2026, 10, 17, 15); // 11월 17일 15:00
const note = (over: { notificationId: string } & Record<string, unknown>) => ({
  type: 'BILLING_REMINDER',
  title: over.notificationId,
  body: '',
  subscriptionId: over.notificationId,
  sentAt: '2026-11-17T14:00:00',
  read: false,
  ...over,
});

const renderList = async (routes: Record<string, unknown>) => {
  mockApi(routes);
  await renderRouter(
    {
      index: () => <HomeNotificationScreen />,
      'checkup/[id]/index': () => null,
      'manage/detail/[id]': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};
const listOf = (notifications: object[]) => ({
  'GET /api/v1/notifications': { notifications },
});
const patchUrls = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'PATCH')
    .map(([url]) => String(url));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('HomeNotificationScreen', () => {
  it('알림이 없으면 빈 상태를 보여 준다', async () => {
    await renderList(listOf([]));

    expect(await screen.findByText('아직 받은 알림이 없어요')).toBeOnTheScreen();
  });

  it('목록을 불러오지 못하면 다시 시도할 수 있다', async () => {
    await renderList({ 'GET /api/v1/notifications': apiError(500) });

    expect(await screen.findByText('정보를 불러오지 못했어요')).toBeOnTheScreen();
  });

  it('30일 안 알림만 오늘·이전 알림으로 나눠 받은 시간과 함께 보여 준다', async () => {
    await renderList(
      listOf([
        note({ notificationId: '오늘 알림', sentAt: '2026-11-17T14:00:00' }),
        note({ notificationId: '지난 알림', sentAt: '2026-11-14T09:00:00' }),
        note({ notificationId: '오래된 알림', sentAt: '2026-10-01T09:00:00' }),
      ]),
    );

    expect(await screen.findByRole('header', { name: '오늘' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: '이전 알림' })).toBeOnTheScreen();
    expect(screen.getByText('1시간 전')).toBeOnTheScreen();
    expect(screen.getByText('11월 14일')).toBeOnTheScreen();
    expect(screen.queryByText('오래된 알림')).not.toBeOnTheScreen();
  });

  it.each([
    ['CHECK_REMINDER', '/checkup/netflix', { id: 'netflix', from: 'push' }],
    ['BILLING_REMINDER', '/manage/detail/netflix', { id: 'netflix' }],
    ['CANCEL_CONFIRM', '/manage/detail/netflix', { id: 'netflix', confirmCancel: '1' }],
  ])('%s 알림을 누르면 읽음 처리하고 정해진 화면으로 간다', async (type, path, params) => {
    const user = await renderList({
      ...listOf([note({ notificationId: 'n1', type, subscriptionId: 'netflix' })]),
      'PATCH /api/v1/notifications/n1/read': null,
    });

    await user.press(await screen.findByRole('button', { name: /^n1/ }));

    expect(screen).toHavePathname(path);
    expect(screen).toHaveSearchParams(params);
    expect(patchUrls()).toEqual(['https://api.test/api/v1/notifications/n1/read']);
  });

  it('이미 읽은 알림은 다시 읽음 처리하지 않는다', async () => {
    const user = await renderList(listOf([note({ notificationId: 'n1', read: true })]));

    await user.press(await screen.findByRole('button', { name: /^n1/ }));

    expect(patchUrls()).toEqual([]);
  });
});
