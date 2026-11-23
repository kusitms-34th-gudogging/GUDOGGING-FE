import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { homeKeys } from '@/hooks/useHome';
import {
  type ApiNotificationType,
  notificationKeys,
  notificationKinds,
} from '@/hooks/useNotifications';
import { useReadNotification } from '@/hooks/useReadNotification';
import { sessionQuery } from '@/hooks/useSession';
import { authToken } from '@/lib/authToken';
import { notificationTarget } from '@/utils/notification';

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

// 서버가 FCM data로 보내는 값 (명세: 푸시 토큰 등록 → 푸시 payload data)
// iOS는 content.data가 Expo 푸시 형식(userInfo.body)만 읽어서 FCM data는 trigger.payload(userInfo)에 있음
const pushDataOf = (notification: Notifications.Notification) => {
  const { trigger } = notification.request;
  const payload = trigger && 'payload' in trigger ? trigger.payload : undefined;
  const { type, subscriptionId, notificationId } = payload ?? {};
  if (
    typeof type !== 'string' ||
    !(type in notificationKinds) ||
    typeof subscriptionId !== 'string' ||
    typeof notificationId !== 'string'
  ) {
    return null;
  }
  return { kind: notificationKinds[type as ApiNotificationType], subscriptionId, notificationId };
};

// 푸시 수신·탭 처리. _layout에서 QueryClientProvider 안쪽에 한 번 호출
export const usePushNotifications = () => {
  const client = useQueryClient();
  const readNotification = useReadNotification().mutate;

  useEffect(() => {
    // 탭하면 알림 목록에서 누른 것과 같게: 읽음 처리 + 같은 화면으로 이동
    const open = async (response: Notifications.NotificationResponse | null) => {
      const data = response && pushDataOf(response.notification);
      if (!data) return;
      // 앱을 꺼진 상태에서 탭해 열었을 때 다시 처리하지 않게 (Expo 문서 예시)
      Notifications.clearLastNotificationResponse();
      // 로그인 세션 확인(S-01)이 끝난 뒤에 이동. 오래 안 열어 리프레시 토큰이 만료됐으면 확인이 토큰을 지움
      // → 이동하지 않고 홈이 로그인으로 보냄. 확인이 네트워크로 실패하면 토큰이 남아 홈처럼 그대로 이동
      await client.fetchQuery(sessionQuery).catch(() => {});
      if (!(await authToken.getRefresh())) return;
      readNotification(data.notificationId);
      router.push(notificationTarget(data.kind, data.subscriptionId));
    };

    // 꺼진 상태에서 탭해 앱이 열렸으면 그 알림부터
    void open(Notifications.getLastNotificationResponse());
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    // 앱을 보는 중에 푸시가 오면 알림 목록·홈 안 읽음 점(hasUnreadNotification)에 바로 반영
    const received = Notifications.addNotificationReceivedListener(() =>
      Promise.all([
        client.invalidateQueries({ queryKey: notificationKeys.all }),
        client.invalidateQueries({ queryKey: homeKeys.all }),
      ]),
    );
    return () => {
      tapped.remove();
      received.remove();
    };
  }, [client, readNotification]);
};
