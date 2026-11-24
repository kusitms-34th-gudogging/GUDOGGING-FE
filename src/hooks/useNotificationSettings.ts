import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

export interface NotificationSettings {
  // 결제 3일 전 점검 알림(D-3)만. 1일 전 결제·해지 확인 알림은 이 설정과 관계없이 발송 (기능명세서 N-02, 26.11.24)
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
