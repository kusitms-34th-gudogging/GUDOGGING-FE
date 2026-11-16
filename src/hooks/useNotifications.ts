import { create } from 'zustand';

import { type AppNotification, NOTIFICATION_SAMPLE } from '@/constants/notification';

interface NotificationsState {
  notifications: AppNotification[];
  markRead: (id: string) => void;
}

// shortcut: 샘플을 앱 메모리에만 둠, 알림 API 생기면 서버 목록·읽음 처리로 교체
export const useNotifications = create<NotificationsState>()((set) => ({
  notifications: NOTIFICATION_SAMPLE,
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
}));
