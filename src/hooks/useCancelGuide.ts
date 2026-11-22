import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';
import type { ApiPaymentMethod } from '@/utils/apiCodes';

interface CancelGuideResponse {
  serviceName: string;
  paymentMethod: ApiPaymentMethod;
  steps: string[];
  cancelUrl: string | null;
  caution: string | null;
}

// 해지 안내(X-01·X-03·X-04·X-05). 문구의 {name}은 화면이 서비스명으로 채움 (fillName)
export interface CancelGuide {
  name: string;
  payment: string;
  steps: string[];
  notice?: string;
  // 없으면 '해지했어요' 버튼 (X-05)
  url?: string;
  cta: string;
}

const PAYMENT: Record<ApiPaymentMethod, string> = {
  APP_STORE: 'App Store 결제',
  GOOGLE_PLAY: 'Google Play 결제',
  WEB_DIRECT: '웹·직접 결제',
};
// 버튼 문구는 결제 경로·링크 유무로 정함 (화면설계서 X-01·X-03·X-04·X-05)
const ctaOf = (paymentMethod: ApiPaymentMethod, url: string | null) =>
  paymentMethod === 'APP_STORE'
    ? 'App Store 구독 관리 열기'
    : paymentMethod === 'GOOGLE_PLAY'
      ? 'Google Play 정기 결제 열기'
      : url
        ? '해지 페이지로 이동'
        : '해지했어요';

// 웹·직접 결제는 서비스별 해지 경로 문구 대신 모든 서비스 공통 3단계 (화면설계서 X-04·X-05)
const WEB_STEPS = [
  '아래 버튼을 눌러 해지 페이지로 이동해요',
  '해지를 완료해요',
  "돌아와서 '해지 완료'를 눌러요",
];
const NO_URL_STEPS = [
  '{name} 앱이나 웹에서 해지 메뉴로 이동해요',
  '해지를 완료해요',
  "돌아와서 '해지했어요'를 눌러요",
];
const stepsOf = ({ paymentMethod, steps, cancelUrl }: CancelGuideResponse) =>
  paymentMethod !== 'WEB_DIRECT' ? steps : cancelUrl ? WEB_STEPS : NO_URL_STEPS;

export const cancelGuideKeys = {
  detail: (subscriptionId: string) => ['cancelGuide', subscriptionId] as const,
};

export const useCancelGuide = (subscriptionId: string) =>
  useQuery({
    queryKey: cancelGuideKeys.detail(subscriptionId),
    queryFn: ({ signal }) =>
      request<CancelGuideResponse>(`/api/v1/subscriptions/${subscriptionId}/cancel-guide`, {
        signal,
      }),
    select: (g): CancelGuide => ({
      name: g.serviceName,
      payment: PAYMENT[g.paymentMethod],
      steps: stepsOf(g),
      notice: g.caution ?? undefined,
      url: g.cancelUrl ?? undefined,
      cta: ctaOf(g.paymentMethod, g.cancelUrl),
    }),
  });
