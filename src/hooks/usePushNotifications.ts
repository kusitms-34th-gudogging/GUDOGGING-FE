import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { homeKeys } from '@/hooks/useHome';
import { notificationKeys } from '@/hooks/useNotifications';
import { queryClient } from '@/lib/queryClient';

// 앱을 보고 있을 때 온 푸시도 배너·알림 센터에 띄움 (iOS 기본은 안 띄움)
// expo-notifications가 iOS 알림 델리게이트를 맡아서 RN Firebase의 firebase.json 표시 옵션은 안 먹음 → 여기서 정함
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 푸시 수신 처리. _layout에서 한 번 호출 (QueryClientProvider 바깥이라 queryClient를 직접 씀)
export const usePushNotifications = () => {
  useEffect(() => {
    // 앱을 보는 중에 푸시가 오면 알림 목록·홈 안 읽음 점(hasUnreadNotification)에 바로 반영
    const received = Notifications.addNotificationReceivedListener(() =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
        queryClient.invalidateQueries({ queryKey: homeKeys.all }),
      ]),
    );
    return () => received.remove();
  }, []);
};
