import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { homeKeys } from '@/hooks/useHome';
import { notificationKeys } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { authToken } from '@/lib/authToken';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';

jest.mock('expo-notifications');

// FCM이 iOS로 보낸 푸시: data는 trigger.payload(userInfo)에 담김
const pushResponse = (payload: Record<string, unknown>) =>
  ({
    notification: { request: { trigger: { type: 'push', payload } } },
  }) as unknown as Notifications.NotificationResponse;

const CHECKUP_PUSH = {
  type: 'CHECK_REMINDER',
  subscriptionId: 'sub-1',
  notificationId: 'noti-1',
};

let tap: (response: Notifications.NotificationResponse) => void;
let receive: () => void;
let push: jest.SpyInstance;

// 로그인 세션 확인(S-01) 통과: 저장된 리프레시 토큰으로 재발급 성공
const SESSION = { 'POST /api/v1/auth/reissue': { accessToken: 'a2', refreshToken: 'r2' } };

beforeEach(async () => {
  await authToken.save({ accessToken: 'a', refreshToken: 'r' });
  jest.mocked(Notifications.addNotificationResponseReceivedListener).mockImplementation((l) => {
    tap = l;
    return { remove: jest.fn() };
  });
  jest.mocked(Notifications.addNotificationReceivedListener).mockImplementation((l) => {
    receive = () => l({} as Notifications.Notification);
    return { remove: jest.fn() };
  });
  jest.mocked(Notifications.getLastNotificationResponse).mockReturnValue(null);
  push = jest.spyOn(router, 'push').mockImplementation(() => {});
});
afterEach(async () => {
  jest.restoreAllMocks();
  await authToken.clear();
});

const render = () => renderHook(() => usePushNotifications(), { wrapper: createQueryWrapper() });

it.each([
  ['CHECK_REMINDER', '/checkup/sub-1?restart=1'],
  ['BILLING_REMINDER', '/manage/detail/sub-1'],
  ['CANCEL_CONFIRM', '/manage/detail/sub-1?confirmCancel=1'],
])('%s 푸시를 탭하면 읽음 처리하고 %s로 이동한다', async (type, target) => {
  const fetchSpy = mockApi({ ...SESSION, 'PATCH /api/v1/notifications/noti-1/read': null });
  await render();

  tap(pushResponse({ ...CHECKUP_PUSH, type }));

  await waitFor(() => expect(push).toHaveBeenCalledWith(target));
  await waitFor(() =>
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.test/api/v1/notifications/noti-1/read',
      expect.anything(),
    ),
  );
});

it('앱이 꺼진 상태에서 푸시를 탭해 열었으면 그 알림 화면으로 간다', async () => {
  mockApi({ ...SESSION, 'PATCH /api/v1/notifications/noti-1/read': null });
  jest
    .mocked(Notifications.getLastNotificationResponse)
    .mockReturnValue(pushResponse(CHECKUP_PUSH));

  await render();

  await waitFor(() => expect(push).toHaveBeenCalledWith('/checkup/sub-1?restart=1'));
  expect(Notifications.clearLastNotificationResponse).toHaveBeenCalled();
});

it('로그인이 만료됐으면 탭해도 이동하지 않는다 (홈이 로그인으로 보냄)', async () => {
  const fetchSpy = mockApi({ 'POST /api/v1/auth/reissue': apiError(401) });
  jest
    .mocked(Notifications.getLastNotificationResponse)
    .mockReturnValue(pushResponse(CHECKUP_PUSH));

  await render();

  await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  await waitFor(async () => expect(await authToken.getRefresh()).toBeNull());
  expect(push).not.toHaveBeenCalled();
});

it('서버 형식이 아닌 푸시는 탭해도 이동하지 않는다', async () => {
  mockApi({ ...SESSION, 'PATCH /api/v1/notifications/noti-1/read': null });
  await render();

  // 'constructor'는 객체가 상속받은 속성이라 type 검사를 잘못 통과하기 쉬움
  tap(pushResponse({ type: 'UNKNOWN', subscriptionId: 'sub-1', notificationId: 'noti-1' }));
  tap(pushResponse({ type: 'constructor', subscriptionId: 'sub-1', notificationId: 'noti-1' }));
  tap(pushResponse({}));
  // 이동은 로그인 확인 뒤라 비동기 → 정상 푸시의 이동을 기다린 뒤 그것만 이동했는지 확인
  tap(pushResponse(CHECKUP_PUSH));

  await waitFor(() => expect(push).toHaveBeenCalledWith('/checkup/sub-1?restart=1'));
  expect(push).toHaveBeenCalledTimes(1);
});

it('앱을 보는 중에 푸시가 오면 알림 목록과 홈을 다시 불러온다', async () => {
  const invalidate = jest.spyOn(QueryClient.prototype, 'invalidateQueries');
  await render();

  receive();

  expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: homeKeys.all });
});

it('앱을 보는 중에도 푸시를 배너로 띄운다', async () => {
  const handler = jest.mocked(Notifications.setNotificationHandler).mock.calls[0][0];

  await expect(
    handler?.handleNotification({} as Notifications.Notification),
  ).resolves.toMatchObject({ shouldShowBanner: true, shouldShowList: true });
});
