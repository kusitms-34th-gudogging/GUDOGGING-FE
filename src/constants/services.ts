export interface Service {
  id: string;
  name: string;
  nameKo: string;
}

// shortcut: 샘플 서비스 목록, 서비스 목록 API 연동 시 API 훅으로 교체
export const SERVICES: Service[] = [
  { id: 'netflix', name: 'Netflix', nameKo: '넷플릭스' },
  { id: 'chatgpt', name: 'ChatGPT', nameKo: '챗지피티' },
  { id: 'youtube', name: 'YouTube Premium', nameKo: '유튜브 프리미엄' },
  { id: 'spotify', name: 'Spotify', nameKo: '스포티파이' },
  { id: 'coupang', name: '쿠팡 와우', nameKo: '쿠팡 와우' },
  { id: 'disney', name: '디즈니+', nameKo: '디즈니 플러스' },
  { id: 'tving', name: '티빙', nameKo: '티빙' },
];

export const PAID_AT = [
  { value: 'web', label: '웹·직접 결제' },
  { value: 'appstore', label: 'App Store' },
  { value: 'playstore', label: 'Google Play' },
] as const;
export type PaidAt = (typeof PAID_AT)[number]['value'];

export interface PaymentInfo {
  category: string;
  amount: number;
  cycle: number;
  unit: string;
  nextDate: Date;
  paidAt: PaidAt;
}
