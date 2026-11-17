import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';

// 해지 이유 코드. 앱 cancelReasons 배열 순서와 같음 (constants/checkup의 cancel())
export const CANCEL_REASON_CODES = [
  'RARELY_USED',
  'PRICE_BURDEN',
  'LACKING',
  'SWITCHING',
  'GOAL_ACHIEVED',
] as const;

type Decision =
  { decision: 'KEEP' } | { decision: 'CANCEL'; cancelReasons: string[]; cancelReasonText?: string };

// 점검 결과 유지/해지 결정 (K-80 유지하기 · K-90 해지 이유)
export const useDecideCheckup = (checkupId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: Decision) =>
      request(`/api/v1/checkups/${checkupId}/decision`, { method: 'PATCH', body }),
    // 유지하면 홈 사용 현황에서 빠짐
    onSuccess: () => invalidateSubscriptionData(client),
  });
};
