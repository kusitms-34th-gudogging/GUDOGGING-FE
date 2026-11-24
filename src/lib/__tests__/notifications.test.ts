import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import {
  notificationPermissionChange,
  rememberNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';

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

describe('notificationPermissionChange', () => {
  beforeEach(async () => {
    resetPermissions();
    await AsyncStorage.clear();
  });

  it('꺼져 있다가 허용되면 반영했다고 기록할 때까지 true', async () => {
    getPermissions.mockResolvedValue(status(false, false));
    await requestNotificationPermission();
    getPermissions.mockResolvedValue(status(true, true));

    expect(await notificationPermissionChange()).toBe(true);
    // 서버 저장이 실패해 기록하지 않았으면 다음 확인에서도 다시 알려 줌
    expect(await notificationPermissionChange()).toBe(true);
    await rememberNotificationPermission(true);
    expect(await notificationPermissionChange()).toBeNull();
  });

  it('허용돼 있다가 꺼지면 false', async () => {
    getPermissions.mockResolvedValue(status(true, true));
    await requestNotificationPermission();
    getPermissions.mockResolvedValue(status(false, false));

    expect(await notificationPermissionChange()).toBe(false);
  });

  it('처음 확인할 때는 기준만 남기고 null', async () => {
    getPermissions.mockResolvedValue(status(true, true));

    expect(await notificationPermissionChange()).toBeNull();
  });
});
