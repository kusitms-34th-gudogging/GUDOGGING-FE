import { logEvent } from '@react-native-firebase/analytics';
import { act, renderHook } from '@testing-library/react-native';

import { useAnalyzeGmail } from '@/hooks/useAnalyzeSubscriptions';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';

const CANDIDATE = {
  serviceId: 'netflix',
  serviceName: 'Netflix',
  logoUrl: null,
  category: 'VIDEO_OTT',
  amount: 13500,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  nextBillingDate: '2026-12-05',
  paymentMethod: 'APP_STORE',
  needsReview: false,
  reviewFields: [],
};

afterEach(() => jest.clearAllMocks());

const analyze = async (analyses: unknown, abort = false) => {
  mockApi({ 'POST /api/v1/gmail/connection': null, 'POST /api/v1/gmail/analyses': analyses });
  const { result } = await renderHook(() => useAnalyzeGmail(), { wrapper: createQueryWrapper() });
  const controller = new AbortController();
  if (abort) controller.abort();
  await act(() =>
    result.current.mutateAsync({ authCode: 'code', signal: controller.signal }).catch(() => {}),
  );
};

it.each([
  ['찾으면 success', { candidates: [CANDIDATE, CANDIDATE] }, 'success', 2],
  ['0개면 empty', { candidates: [] }, 'empty', 0],
  ['오류면 fail', apiError(500), 'fail', 0],
])('불러오기가 끝나면 결과를 GA로 보낸다: %s', async (_, analyses, result, found_count) => {
  await analyze(analyses);
  expect(logEvent).toHaveBeenCalledWith(undefined, 'reg_import_result', {
    method: 'gmail',
    result,
    found_count,
  });
});

it('화면을 떠나 취소된 분석은 실패로 보내지 않는다', async () => {
  await analyze(apiError(500), true);
  expect(logEvent).not.toHaveBeenCalled();
});
