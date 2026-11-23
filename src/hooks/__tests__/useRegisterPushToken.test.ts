import { act, renderHook } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import { useRegisterPushToken } from '@/hooks/useRegisterPushToken';
import { createQueryWrapper, mockApi } from '@/lib/testing';

jest.mock('expo-notifications');
afterEach(() => jest.restoreAllMocks());

const granted = (value: boolean) =>
  jest
    .mocked(Notifications.getPermissionsAsync)
    .mockResolvedValue({ granted: value } as Notifications.NotificationPermissionsStatus);

it('알림 권한이 있으면 FCM 토큰과 기기 종류를 등록한다', async () => {
  granted(true);
  const fetchSpy = mockApi({ 'POST /api/v1/notifications/tokens': null });
  const { result } = await renderHook(() => useRegisterPushToken(), {
    wrapper: createQueryWrapper(),
  });

  await act(() => result.current.mutateAsync());

  expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toEqual({
    deviceToken: 'fcm-test-token',
    platform: 'IOS',
  });
});

it('알림 권한이 없으면 토큰을 보내지 않는다', async () => {
  granted(false);
  const fetchSpy = mockApi({});
  const { result } = await renderHook(() => useRegisterPushToken(), {
    wrapper: createQueryWrapper(),
  });

  await act(() => result.current.mutateAsync());

  expect(fetchSpy).not.toHaveBeenCalled();
});
