import * as Notifications from 'expo-notifications';

// OS 알림 권한을 요청하고 허용 여부를 돌려줌. 이미 정해졌거나 다시 물을 수 없으면 팝업 없이 현재 상태만 확인
export const requestNotificationPermission = async () => {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || !current.canAskAgain) return current.granted;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
};
