import { useQuery } from '@tanstack/react-query';

import type { AppNotification, NotificationKind } from '@/constants/notification';
import { request } from '@/lib/request';

type ApiNotificationType = 'CHECK_REMINDER' | 'BILLING_REMINDER' | 'CANCEL_CONFIRM';

interface NotificationListResponse {
  notifications: {
    notificationId: string;
    type: ApiNotificationType;
    title: string;
    body: string;
    subscriptionId: string;
    sentAt: string;
    read: boolean;
  }[];
}

const KIND: Record<ApiNotificationType, NotificationKind> = {
  CHECK_REMINDER: 'checkup',
  BILLING_REMINDER: 'payment',
  CANCEL_CONFIRM: 'cancel-confirm',
};

// shortcut: 명세에 서비스 로고가 없어 기본 로고, 응답에 logoUrl 생기면 교체
const LOGO = require('@/assets/images/logo_placeholder.png');

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
        logo: LOGO,
        // 시간대 없는 ISO라 기기 시간대(한국)로 읽힘
        receivedAt: new Date(n.sentAt),
        read: n.read,
      })),
  });
