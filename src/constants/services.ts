// 사전 등록 서비스 (서비스 목록 API, hooks/useServices)
export interface Service {
  id: string;
  name: string;
  category: string;
  // 사전 등록 요금제 기본 금액 (구독 정보 입력의 결제 금액 기본값)
  defaultAmount?: number;
}

export const PAID_AT = [
  { value: 'web', label: '웹·직접 결제' },
  { value: 'appstore', label: 'App Store' },
  { value: 'playstore', label: 'Google Play' },
] as const;
export type PaidAt = (typeof PAID_AT)[number]['value'];

export interface FoundSubscription {
  // 분석 결과 항목 id. 사전 등록 서비스 id와 겹치지 않게 따로 둠
  id: string;
  // 사전 등록 서비스로 인식됐으면 그 서비스 id
  serviceId?: string;
  name: string;
  payment: Partial<PaymentInfo>;
  issue?: string;
}

// shortcut: 스크린샷 분석 API 없이 샘플 결과, API 연동 시 분석 응답 훅으로 교체
export const FOUND_SAMPLE: FoundSubscription[] = [
  {
    id: 'found-chatgpt',
    serviceId: 'chatgpt',
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
  },
  {
    id: 'custom-found-millie',
    name: '밀리의 서재',
    payment: { category: '교육·학습', amount: 9900, cycle: 1, unit: '개월', paidAt: 'web' },
    issue: '결제일 확인 필요해요',
  },
  {
    id: 'found-netflix',
    serviceId: 'netflix',
    name: 'Netflix',
    payment: { category: '영상·OTT', amount: 13500, cycle: 1, unit: '개월', paidAt: 'web' },
    issue: '금액·결제일 확인 필요해요',
  },
  {
    id: 'found-youtube',
    serviceId: 'youtube',
    name: 'YouTube Premium',
    payment: {
      category: '영상·OTT',
      amount: 17000,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    },
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
