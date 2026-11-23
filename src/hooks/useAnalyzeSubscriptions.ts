import { useMutation } from '@tanstack/react-query';
import { File } from 'expo-file-system';
import { router } from 'expo-router';

import type { FoundSubscription, ReviewField } from '@/constants/services';
import { requestGmailAuthCode } from '@/lib/account';
import { track } from '@/lib/analytics';
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

// signal: 분석 중 화면을 떠나면 요청을 취소 (화면설계서 A-12 '뒤로가기 시 작업 중단')
const analyze = async (path: string, signal: AbortSignal, body?: FormData) => {
  const { candidates } = await request<{ candidates: Candidate[] }>(path, {
    method: 'POST',
    body,
    signal,
  });
  return candidates.map(toFound);
};

// 분석이 끝나면 GA로 결과를 보냄. 화면을 떠나 취소된 건 실패로 세지 않음
const trackImport = (method: 'screenshot' | 'gmail') => ({
  onSuccess: (found: FoundSubscription[]) =>
    track('reg_import_result', {
      method,
      result: found.length > 0 ? 'success' : 'empty',
      found_count: found.length,
    }),
  onError: (_: unknown, { signal }: { signal: AbortSignal }) => {
    if (!signal.aborted) track('reg_import_result', { method, result: 'fail', found_count: 0 });
  },
});

// 스크린샷 분석 (A-08): 고른 이미지(PNG·JPG, 1~5장)를 multipart로
export const useAnalyzeScreenshots = () =>
  useMutation({
    mutationFn: ({ uris, signal }: { uris: string[]; signal: AbortSignal }) => {
      const form = new FormData();
      // SDK 58의 전역 fetch(expo/fetch)는 RN식 { uri, name, type }을 못 읽어서 expo-file-system File(Blob 구현)로 붙임
      // 파일 이름·MIME 타입은 파일에서 가져옴 (Expo 문서 FileSystem "Uploading files using expo/fetch")
      uris.forEach((uri) => form.append('images', new File(uri)));
      return analyze('/api/v1/subscriptions/screenshots/analyses', signal, form);
    },
    ...trackImport('screenshot'),
  });

// Gmail 연동하기 (A-11): Google 계정 선택·권한 동의 후 결제 메일 분석(A-12)으로
// 취소하면 그 화면에 그대로, 인증 코드를 못 받으면 분석 실패(A-12e)로 (화면설계서 5-1·5-2)
// 빠르게 두 번 눌러 인증이 겹치면 SDK가 첫 인증을 실패로 끝내서, 진행 중이면 무시
let gmailAuthPending = false;
export const startGmailAnalysis = async () => {
  if (gmailAuthPending) return;
  gmailAuthPending = true;
  try {
    const authCode = await requestGmailAuthCode();
    if (authCode)
      router.push({ pathname: '/register/analyze', params: { source: 'gmail', authCode } });
  } catch {
    router.push({ pathname: '/register/failed', params: { source: 'gmail' } });
  } finally {
    gmailAuthPending = false;
  }
};

// 받은 인증 코드로 Gmail 연동 → 결제 메일 분석 (A-12)
export const useAnalyzeGmail = () =>
  useMutation({
    mutationFn: async ({ authCode, signal }: { authCode: string; signal: AbortSignal }) => {
      await request('/api/v1/gmail/connection', { method: 'POST', body: { authCode }, signal });
      return analyze('/api/v1/gmail/analyses', signal);
    },
    ...trackImport('gmail'),
  });
