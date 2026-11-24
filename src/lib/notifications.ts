import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// granted 허용 / denied 방금 팝업에서 거부 / blocked 이미 거부돼 팝업을 다시 못 띄움 (기기 설정에서만 켤 수 있음)
export type NotificationPermission = 'granted' | 'denied' | 'blocked';

// 마지막으로 확인한 OS 권한. 설정 앱에서 새로 허용했는지 알려고 앱을 다시 켜도 남게 저장
const LAST_GRANTED_KEY = 'notification-permission-granted';
const saveGranted = (granted: boolean) =>
  AsyncStorage.setItem(LAST_GRANTED_KEY, String(granted)).catch(() => {});

// OS 알림 권한을 요청하고 결과를 돌려줌. 이미 정해졌거나 다시 물을 수 없으면 팝업 없이 현재 상태만 확인
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || !current.canAskAgain) {
      await saveGranted(current.granted);
      return current.granted ? 'granted' : 'blocked';
    }
    const { granted } = await Notifications.requestPermissionsAsync();
    await saveGranted(granted);
    return granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
};

// 지난번 확인 이후 OS 권한이 바뀌었으면 지금 허용 여부, 그대로면 null (기기 설정에서 직접 켜거나 끄고 돌아온 경우)
// 처음 확인할 때(저장값 없음)는 기준만 남기고 null
export const notificationPermissionChange = async () => {
  try {
    const [{ granted }, last] = await Promise.all([
      Notifications.getPermissionsAsync(),
      AsyncStorage.getItem(LAST_GRANTED_KEY),
    ]);
    await saveGranted(granted);
    return last !== null && last !== String(granted) ? granted : null;
  } catch {
    return null;
  }
};
