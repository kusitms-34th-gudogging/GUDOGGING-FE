import { useQuery } from '@tanstack/react-query';

import type { AppNotification, NotificationKind } from '@/constants/notification';
import { serviceLogo } from '@/constants/services';
import { request } from '@/lib/request';

type ApiNotificationType = 'CHECK_REMINDER' | 'BILLING_REMINDER' | 'CANCEL_CONFIRM';

interface NotificationListResponse {
  notifications: {
    notificationId: string;
    type: ApiNotificationType;
    title: string;
    body: string;
    subscriptionId: string;
    // 직접 입력한 구독은 null, 여러 건 묶음이면 금액이 가장 큰 구독의 로고
    logoUrl: string | null;
    sentAt: string;
    read: boolean;
  }[];
}

const KIND: Record<ApiNotificationType, NotificationKind> = {
  CHECK_REMINDER: 'checkup',
  BILLING_REMINDER: 'payment',
  CANCEL_CONFIRM: 'cancel-confirm',
};

export const notificationKeys = {
  all: ['notifications'] as const,
};

// H-04 알림 목록 (최근 30일, 최신순)
export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.all,
    queryFn: ({ signal }) => request<NotificationListResponse>('/api/v1/notifications', { signal }),
    select: (data): AppNotification[] =>
      data.notifications.map((n) => ({
        id: n.notificationId,
        kind: KIND[n.type],
        subscriptionId: n.subscriptionId,
        title: n.title,
        description: n.body,
        logo: serviceLogo(n.logoUrl ?? undefined),
        // 시간대 없는 ISO라 기기 시간대(한국)로 읽힘
        receivedAt: new Date(n.sentAt),
        read: n.read,
      })),
  });
