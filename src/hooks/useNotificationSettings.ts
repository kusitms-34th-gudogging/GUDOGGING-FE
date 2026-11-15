import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationSettings {
  // 꾸준히 쓰는 구독: 결제 3일 전 점검 알림
  checkupReminder: boolean;
  setCheckupReminder: (on: boolean) => void;
}

// shortcut: 기기에만 저장, 알림 설정 API 생기면 서버 저장으로 교체
export const useNotificationSettings = create<NotificationSettings>()(
  persist(
    (set) => ({
      checkupReminder: false,
      setCheckupReminder: (checkupReminder) => set({ checkupReminder }),
    }),
    { name: 'notification-settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
