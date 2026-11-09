export interface Service {
  id: string;
  name: string;
  nameKo: string;
  category: string;
}

// shortcut: 샘플 서비스 목록, 서비스 목록 API 연동 시 API 훅으로 교체
export const SERVICES: Service[] = [
  { id: 'netflix', name: 'Netflix', nameKo: '넷플릭스', category: '영상·OTT' },
  { id: 'chatgpt', name: 'ChatGPT', nameKo: '챗지피티', category: '생산성·AI' },
  { id: 'youtube', name: 'YouTube Premium', nameKo: '유튜브 프리미엄', category: '영상·OTT' },
  { id: 'spotify', name: 'Spotify', nameKo: '스포티파이', category: '음악' },
  { id: 'coupang', name: '쿠팡 와우', nameKo: '쿠팡 와우', category: '쇼핑·멤버십' },
  { id: 'disney', name: '디즈니+', nameKo: '디즈니 플러스', category: '영상·OTT' },
  { id: 'tving', name: '티빙', nameKo: '티빙', category: '영상·OTT' },
];

export const PAID_AT = [
  { value: 'web', label: '웹·직접 결제' },
  { value: 'appstore', label: 'App Store' },
  { value: 'playstore', label: 'Google Play' },
] as const;
export type PaidAt = (typeof PAID_AT)[number]['value'];

export interface FoundSubscription {
  id: string;
  name: string;
  payment: Partial<PaymentInfo>;
  issue?: string;
  checked: boolean;
}

// shortcut: 스크린샷 분석 API 없이 샘플 결과, API 연동 시 분석 응답 훅으로 교체
export const FOUND_SAMPLE: FoundSubscription[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    payment: {
      category: '생산성·AI',
      amount: 29000,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    },
    issue: '금액을 읽지 못했어요',
    checked: true,
  },
  {
    id: 'custom-found-millie',
    name: '밀리의 서재',
    payment: { category: '교육·학습', amount: 9900, cycle: 1, unit: '개월', paidAt: 'web' },
    issue: '결제일 확인 필요해요',
    checked: false,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    payment: { category: '영상·OTT', amount: 13500, cycle: 1, unit: '개월', paidAt: 'web' },
    issue: '금액·결제일 확인 필요해요',
    checked: true,
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    payment: {
      category: '영상·OTT',
      amount: 17000,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    },
    checked: true,
  },
];

export interface PaymentInfo {
  name?: string;
  category: string;
  amount: number;
  cycle: number;
  unit: string;
  nextDate: Date;
  paidAt: PaidAt;
}
