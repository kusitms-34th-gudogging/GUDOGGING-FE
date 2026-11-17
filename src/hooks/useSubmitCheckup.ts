import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkupKeys } from '@/hooks/useCheckups';
import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';

const TYPES = ['USAGE', 'SATISFACTION', 'PLAN'] as const;

// 4/4까지 답한 점검 제출 (K-70 → K-80). scores는 이용도·만족도·계획 순 1~5
export const useSubmitCheckup = (subscriptionId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ scores, memo }: { scores: number[]; memo: string }) =>
      request<{ checkupId: string }>(`/api/v1/subscriptions/${subscriptionId}/checkups`, {
        method: 'POST',
        body: {
          answers: TYPES.map((type, i) => ({ type, score: scores[i] })),
          ...(memo && { memo }),
        },
      }),
    // 점검하면 홈 사용 현황·상세 지난 점검·다음 점검 문항의 지난 메모가 바뀜
    onSuccess: () =>
      Promise.all([
        invalidateSubscriptionData(client),
        client.invalidateQueries({ queryKey: checkupKeys.all }),
      ]),
  });
};
