import { useMutation, useQueryClient } from '@tanstack/react-query';

import { draftKeys } from '@/hooks/useSubscriptionDraft';
import { request } from '@/lib/request';

// 구독 등록 임시저장 삭제 (새로 등록하기·나가기). 없어도 성공 (명세)
export const useDeleteSubscriptionDraft = () => {
  const client = useQueryClient();
  return useMutation({
    // 저장과 같은 scope: 저장 뒤 삭제가 먼저 끝나 초안이 되살아나지 않게
    scope: { id: 'subscription-draft' },
    mutationFn: () => request('/api/v1/subscriptions/drafts', { method: 'DELETE' }),
    onSuccess: () => client.setQueryData(draftKeys.all, null),
  });
};
