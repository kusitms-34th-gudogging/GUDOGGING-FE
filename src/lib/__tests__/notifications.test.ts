import * as Notifications from 'expo-notifications';

import { requestNotificationPermission } from '@/lib/notifications';

jest.mock('expo-notifications');

const getPermissions = jest.mocked(Notifications.getPermissionsAsync);
const requestPermissions = jest.mocked(Notifications.requestPermissionsAsync);

const status = (granted: boolean, canAskAgain: boolean) =>
  ({ granted, canAskAgain }) as Notifications.NotificationPermissionsStatus;

describe('requestNotificationPermission', () => {
  beforeEach(() => jest.resetAllMocks());

  it('아직 정해지지 않았으면 OS에 요청하고 응답을 돌려준다', async () => {
    getPermissions.mockResolvedValue(status(false, true));
    requestPermissions.mockResolvedValue(status(true, true));

    expect(await requestNotificationPermission()).toBe(true);
    expect(requestPermissions).toHaveBeenCalledTimes(1);
  });

  it('이미 허용돼 있으면 요청하지 않는다', async () => {
    getPermissions.mockResolvedValue(status(true, true));

    expect(await requestNotificationPermission()).toBe(true);
    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it('이미 거부돼 다시 물을 수 없으면 요청 없이 false', async () => {
    getPermissions.mockResolvedValue(status(false, false));

    expect(await requestNotificationPermission()).toBe(false);
    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it('권한 조회가 실패해도 false로 끝난다', async () => {
    getPermissions.mockRejectedValue(new Error('unavailable'));

    expect(await requestNotificationPermission()).toBe(false);
  });
});
