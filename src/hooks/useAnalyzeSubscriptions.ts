import { useMutation } from '@tanstack/react-query';
import { File } from 'expo-file-system';

import type { FoundSubscription, ReviewField } from '@/constants/services';
import { request } from '@/lib/request';
import {
  type ApiCategory,
  type ApiCycleUnit,
  type ApiPaymentMethod,
  CATEGORY_LABEL,
  CYCLE_UNIT,
  PAID_AT_OF,
} from '@/utils/apiCodes';
import { parseDate } from '@/utils/date';

// 스크린샷·Gmail 분석 결과 후보. 읽지 못한 값은 null (명세)
interface Candidate {
  serviceId: string | null;
  serviceName: string;
  logoUrl: string | null;
  category: ApiCategory;
  amount: number | null;
  billingCycleValue: number | null;
  billingCycleUnit: ApiCycleUnit | null;
  nextBillingDate: string | null;
  paymentMethod: ApiPaymentMethod | null;
  needsReview: boolean;
  // shortcut: Gmail 분석 명세엔 아직 없어 선택, Gmail도 생기면 필수로
  reviewFields?: ReviewField[];
}

// 불러온 구독 항목 id. 직접 입력처럼 다루는 항목(사전 등록 서비스 아님)은 custom- (useRegisterServices 기준)
const toFound = (c: Candidate, i: number): FoundSubscription => ({
  id: c.serviceId ? `found-${i}` : `custom-found-${i}`,
  serviceId: c.serviceId ?? undefined,
  name: c.serviceName,
  logoUrl: c.logoUrl ?? undefined,
  payment: {
    category: CATEGORY_LABEL[c.category],
    amount: c.amount ?? undefined,
    cycle: c.billingCycleValue ?? undefined,
    unit: c.billingCycleUnit ? CYCLE_UNIT[c.billingCycleUnit] : undefined,
    nextDate: c.nextBillingDate ? parseDate(c.nextBillingDate) : undefined,
    paidAt: c.paymentMethod ? PAID_AT_OF[c.paymentMethod] : undefined,
  },
  needsReview: c.needsReview,
  reviewFields: c.reviewFields ?? [],
});

const analyze = async (path: string, body?: FormData) => {
  const { candidates } = await request<{ candidates: Candidate[] }>(path, { method: 'POST', body });
  return candidates.map(toFound);
};

// 스크린샷 분석 (A-08): 고른 이미지(PNG·JPG, 1~5장)를 multipart로
export const useAnalyzeScreenshots = () =>
  useMutation({
    mutationFn: (uris: string[]) => {
      const form = new FormData();
      // SDK 58의 전역 fetch(expo/fetch)는 RN식 { uri, name, type }을 못 읽어서 expo-file-system File(Blob 구현)로 붙임
      // 파일 이름·MIME 타입은 파일에서 가져옴 (Expo 문서 FileSystem "Uploading files using expo/fetch")
      uris.forEach((uri) => form.append('images', new File(uri)));
      return analyze('/api/v1/subscriptions/screenshots/analyses', form);
    },
  });

// Gmail 연동 후 결제 메일 분석 (A-11 → A-12)
// shortcut: Google 로그인(OAuth)이 아직 없어 임시 인증 코드로 연동, OAuth 붙이면 받은 authCode로 교체
export const useAnalyzeGmail = () =>
  useMutation({
    mutationFn: async () => {
      await request('/api/v1/gmail/connection', {
        method: 'POST',
        body: { authCode: 'pending-oauth' },
      });
      return analyze('/api/v1/gmail/analyses');
    },
  });
