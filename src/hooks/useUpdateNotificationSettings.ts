import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type NotificationSettings,
  notificationSettingsKeys,
} from '@/hooks/useNotificationSettings';
import { request } from '@/lib/request';

// 알림 설정 변경. 응답이 바뀐 설정이라 다시 조회하지 않고 캐시에 바로 씀
export const useUpdateNotificationSettings = () => {
  const client = useQueryClient();
  return useMutation({
    // 토글을 빠르게 켜고 끄거나 권한이 연달아 바뀌어도 보낸 순서대로 저장 (늦게 도착한 요청이 덮어쓰지 않게)
    scope: { id: 'notification-settings' },
    mutationFn: (settings: NotificationSettings) =>
      request<NotificationSettings>('/api/v1/notifications/settings', {
        method: 'PATCH',
        body: settings,
      }),
    onSuccess: (data) => client.setQueryData(notificationSettingsKeys.all, data),
  });
};
