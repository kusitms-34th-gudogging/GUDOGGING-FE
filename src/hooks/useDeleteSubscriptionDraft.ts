import { useMutation, useQueryClient } from '@tanstack/react-query';

import { draftKeys } from '@/hooks/useSubscriptionDraft';
import { request } from '@/lib/request';

// 구독 등록 임시저장 삭제 (새로 등록하기·나가기). 없어도 성공 (명세)
export const useDeleteSubscriptionDraft = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => request('/api/v1/subscriptions/drafts', { method: 'DELETE' }),
    onSuccess: () => client.setQueryData(draftKeys.all, null),
  });
};
