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

const LOGO = require('@/assets/images/logo_placeholder.png');
const HOUR = 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms);

// shortcut: Figma H-04 샘플, 알림 API가 생기면 훅으로 교체
// 받은 시각은 앱을 켠 때 기준이라 '오늘'·'이전 알림'이 늘 같이 보임
export const NOTIFICATION_SAMPLE: AppNotification[] = [
  {
    id: 'netflix-tomorrow',
    kind: 'payment',
    subscriptionId: 'netflix',
    title: '내일 넷플릭스 13,500원이 결제돼요',
    description: '지난 점검에서 ‘유지’로 정했어요.\n마음이 바뀌었다면 오늘 확인해 보세요.',
    logo: LOGO,
    receivedAt: ago(HOUR),
    read: false,
  },
  {
    id: 'youtube-3days',
    kind: 'checkup',
    subscriptionId: 'youtube',
    title: '유튜브 프리미엄 결제 3일 전이에요',
    description: '30초 구독 점검으로 계속 쓸지 정해 보세요.',
    logo: LOGO,
    receivedAt: ago(HOUR),
    read: false,
  },
  {
    id: 'chatgpt-3days',
    kind: 'checkup',
    subscriptionId: 'chatgpt',
    title: 'ChatGPT Plus 결제 3일 전이에요',
    description: '30초 구독 점검으로 계속 쓸지 정해 보세요.',
    logo: LOGO,
    receivedAt: ago(72 * HOUR),
    read: true,
  },
  {
    id: 'claude-cancel',
    kind: 'cancel-confirm',
    subscriptionId: 'claude',
    title: 'Claude, 해지하셨나요?',
    description: '아직이라면 내일 29,000원이 결제돼요.',
    logo: LOGO,
    receivedAt: ago(144 * HOUR),
    read: true,
  },
];
