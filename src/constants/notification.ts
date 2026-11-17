import type { ImageSourcePropType } from 'react-native';

// 화면설계서 NOT-001: 3일 전 점검(N-01) · 1일 전(N-02 기본) · 해지 확인(N-02)
export type NotificationKind = 'checkup' | 'payment' | 'cancel-confirm';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  subscriptionId: string;
  title: string;
  description: string;
  logo: ImageSourcePropType;
  receivedAt: Date;
  read: boolean;
}
