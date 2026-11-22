import { useMutation } from '@tanstack/react-query';
import { File } from 'expo-file-system';
import { router } from 'expo-router';

import type { FoundSubscription, ReviewField } from '@/constants/services';
import { requestGmailAuthCode } from '@/lib/account';
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
  reviewFields: ReviewField[];
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
  reviewFields: c.reviewFields,
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

// Gmail 연동하기 (A-11): Google 계정 선택·권한 동의 후 결제 메일 분석(A-12)으로
// 취소하면 그 화면에 그대로, 인증 코드를 못 받으면 분석 실패(A-12e)로 (화면설계서 5-1·5-2)
export const startGmailAnalysis = async () => {
  try {
    const authCode = await requestGmailAuthCode();
    if (authCode)
      router.push({ pathname: '/register/analyze', params: { source: 'gmail', authCode } });
  } catch {
    router.push({ pathname: '/register/failed', params: { source: 'gmail' } });
  }
};

// 받은 인증 코드로 Gmail 연동 → 결제 메일 분석 (A-12)
export const useAnalyzeGmail = () =>
  useMutation({
    mutationFn: async (authCode: string) => {
      await request('/api/v1/gmail/connection', { method: 'POST', body: { authCode } });
      return analyze('/api/v1/gmail/analyses');
    },
  });
