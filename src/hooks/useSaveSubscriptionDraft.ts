import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RegisterStep } from '@/hooks/useRegisterDraft';
import { type DraftItem, draftKeys } from '@/hooks/useSubscriptionDraft';
import { request } from '@/lib/request';

// 구독 등록 임시저장 (덮어씀, 사용자당 1건)
export const useSaveSubscriptionDraft = () => {
  const client = useQueryClient();
  return useMutation({
    // 저장·삭제를 보낸 순서대로 하나씩 처리. 앞선 저장이 늦게 끝나 최신 초안을 덮어쓰지 않게
    scope: { id: 'subscription-draft' },
    mutationFn: (draft: {
      items: DraftItem[];
      lastStep: RegisterStep;
      // INPUT_SUBSCRIPTION일 때만 (toDraftStep)
      editingItemIndex?: number | null;
    }) =>
      request<{ savedAt: string }>('/api/v1/subscriptions/drafts', { method: 'PUT', body: draft }),
    onSuccess: () => client.invalidateQueries({ queryKey: draftKeys.all }),
  });
};
