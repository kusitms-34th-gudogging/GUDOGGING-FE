import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

export interface NotificationSettings {
  // 결제 전 점검 알림 (D-3 점검·D-1 결제 알림 모두)
  paymentReminderEnabled: boolean;
}

export const notificationSettingsKeys = {
  all: ['notificationSettings'] as const,
};

// E-05 알림 설정
export const useNotificationSettings = () =>
  useQuery({
    queryKey: notificationSettingsKeys.all,
    queryFn: ({ signal }) =>
      request<NotificationSettings>('/api/v1/notifications/settings', { signal }),
  });
