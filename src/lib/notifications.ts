import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// granted 허용 / denied 방금 팝업에서 거부 / blocked 이미 거부돼 팝업을 다시 못 띄움 (기기 설정에서만 켤 수 있음)
export type NotificationPermission = 'granted' | 'denied' | 'blocked';

// 점검 알림 설정에 반영한 OS 권한. 설정 앱에서 권한을 바꿨는지 알려고 앱을 다시 켜도 남게 저장
// 서버 저장이 실패하면 반영 전 값으로 남겨 두어 다음 확인 때 다시 시도
const LAST_GRANTED_KEY = 'notification-permission-granted';
export const rememberNotificationPermission = (granted: boolean) =>
  AsyncStorage.setItem(LAST_GRANTED_KEY, String(granted)).catch(() => {});

// OS 알림 권한을 요청하고 결과를 돌려줌. 이미 정해졌거나 다시 물을 수 없으면 팝업 없이 현재 상태만 확인
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || !current.canAskAgain) {
      await rememberNotificationPermission(current.granted);
      return current.granted ? 'granted' : 'blocked';
    }
    const { granted } = await Notifications.requestPermissionsAsync();
    await rememberNotificationPermission(granted);
    return granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
};

// 반영한 권한과 지금 OS 권한이 다르면 지금 허용 여부, 같으면 null (기기 설정에서 직접 켜거나 끄고 돌아온 경우)
// 다를 때는 기록하지 않음 → 서버 저장이 성공하면 호출한 쪽이 rememberNotificationPermission으로 기록
// 처음 확인할 때(저장값 없음)는 기준만 남기고 null
export const notificationPermissionChange = async () => {
  try {
    const [{ granted }, last] = await Promise.all([
      Notifications.getPermissionsAsync(),
      AsyncStorage.getItem(LAST_GRANTED_KEY),
    ]);
    if (last === null) await rememberNotificationPermission(granted);
    return last !== null && last !== String(granted) ? granted : null;
  } catch {
    return null;
  }
};
