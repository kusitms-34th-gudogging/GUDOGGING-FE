// 사전 등록 서비스 (서비스 목록 API, hooks/useServices)
export interface Service {
  id: string;
  name: string;
  category: string;
  // 사전 등록 요금제 기본 금액 (구독 정보 입력의 결제 금액 기본값)
  defaultAmount?: number;
  logoUrl?: string;
}

// 서비스 로고. 없으면 기본 이미지 (명세: logoUrl이 null이면 기본 이미지)
export const serviceLogo = (logoUrl?: string) =>
  logoUrl ? { uri: logoUrl } : require('@/assets/images/logo_placeholder.png');

export const PAID_AT = [
  { value: 'web', label: '웹·직접 결제' },
  { value: 'appstore', label: 'App Store' },
  { value: 'playstore', label: 'Google Play' },
] as const;
export type PaidAt = (typeof PAID_AT)[number]['value'];

// 스크린샷·Gmail 분석으로 불러온 구독 (hooks/useAnalyzeSubscriptions)
export interface FoundSubscription {
  // 분석 결과 항목 id. 사전 등록 서비스 id와 겹치지 않게 따로 둠
  id: string;
  // 사전 등록 서비스로 인식됐으면 그 서비스 id
  serviceId?: string;
  name: string;
  payment: Partial<PaymentInfo>;
  // 읽지 못했거나 불확실한 값이 있어 확인 필요 (금액 에러를 켠 채로 수정 화면이 열림)
  needsReview?: boolean;
}

export interface PaymentInfo {
  name?: string;
  category: string;
  amount: number;
  cycle: number;
  unit: string;
  nextDate: Date;
  paidAt: PaidAt;
}
