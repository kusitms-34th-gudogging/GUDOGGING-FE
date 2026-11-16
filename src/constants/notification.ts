import type { ImageSourcePropType } from 'react-native';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  logo: ImageSourcePropType;
  // 오늘 받은 안 읽은 알림이면 true, 이전 알림이면 false
  today: boolean;
}

const LOGO = require('@/assets/images/logo_placeholder.png');

// shortcut: Figma H-04 샘플, 알림 API가 생기면 훅으로 교체
export const NOTIFICATION_SAMPLE: AppNotification[] = [
  {
    id: 'netflix-tomorrow',
    title: '내일 넷플릭스 13,500원이 결제돼요',
    description: '지난 점검에서 ‘유지’로 정했어요.\n마음이 바뀌었다면 오늘 확인해 보세요.',
    time: '1시간 전',
    logo: LOGO,
    today: true,
  },
  {
    id: 'youtube-3days',
    title: '유튜브 프리미엄 결제 3일 전이에요',
    description: '30초 구독 점검으로 계속 쓸지 정해 보세요.',
    time: '1시간 전',
    logo: LOGO,
    today: true,
  },
  {
    id: 'chatgpt-3days',
    title: 'ChatGPT Plus 결제 3일 전이에요',
    description: '30초 구독 점검으로 계속 쓸지 정해 보세요.',
    time: '10월 14일',
    logo: LOGO,
    today: false,
  },
  {
    id: 'claude-cancel',
    title: 'Claude, 해지하셨나요?',
    description: '아직이라면 내일 29,000원이 결제돼요.',
    time: '10월 11일',
    logo: LOGO,
    today: false,
  },
];
