import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { notificationPermissionGained, requestNotificationPermission } from '@/lib/notifications';

jest.mock('expo-notifications');

const getPermissions = jest.mocked(Notifications.getPermissionsAsync);
const requestPermissions = jest.mocked(Notifications.requestPermissionsAsync);

// AsyncStorage jest mock도 jest.fn이라 resetAllMocks 대신 권한 mock만 초기화
const resetPermissions = () => {
  getPermissions.mockReset();
  requestPermissions.mockReset();
};

const status = (granted: boolean, canAskAgain: boolean) =>
  ({ granted, canAskAgain }) as Notifications.NotificationPermissionsStatus;

describe('requestNotificationPermission', () => {
  beforeEach(resetPermissions);

  it('아직 정해지지 않았으면 OS에 요청하고 응답을 돌려준다', async () => {
    getPermissions.mockResolvedValue(status(false, true));
    requestPermissions.mockResolvedValue(status(true, true));

    expect(await requestNotificationPermission()).toBe('granted');
    expect(requestPermissions).toHaveBeenCalledTimes(1);
  });

  it('이미 허용돼 있으면 요청하지 않는다', async () => {
    getPermissions.mockResolvedValue(status(true, true));

    expect(await requestNotificationPermission()).toBe('granted');
    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it('팝업에서 거부하면 denied', async () => {
    getPermissions.mockResolvedValue(status(false, true));
    requestPermissions.mockResolvedValue(status(false, false));

    expect(await requestNotificationPermission()).toBe('denied');
  });

  it('이미 거부돼 다시 물을 수 없으면 요청 없이 blocked', async () => {
    getPermissions.mockResolvedValue(status(false, false));

    expect(await requestNotificationPermission()).toBe('blocked');
    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it('권한 조회가 실패해도 denied로 끝난다', async () => {
    getPermissions.mockRejectedValue(new Error('unavailable'));

    expect(await requestNotificationPermission()).toBe('denied');
  });
});

describe('notificationPermissionGained', () => {
  beforeEach(async () => {
    resetPermissions();
    await AsyncStorage.clear();
  });

  it('지난번엔 꺼져 있다가 지금 허용돼 있으면 한 번만 true', async () => {
    getPermissions.mockResolvedValue(status(false, false));
    await requestNotificationPermission();
    getPermissions.mockResolvedValue(status(true, true));

    expect(await notificationPermissionGained()).toBe(true);
    expect(await notificationPermissionGained()).toBe(false);
  });

  it('처음 확인할 때는 허용돼 있어도 false (기준만 남김)', async () => {
    getPermissions.mockResolvedValue(status(true, true));

    expect(await notificationPermissionGained()).toBe(false);
  });

  it('계속 꺼져 있으면 false', async () => {
    getPermissions.mockResolvedValue(status(false, false));
    await notificationPermissionGained();

    expect(await notificationPermissionGained()).toBe(false);
  });
});
