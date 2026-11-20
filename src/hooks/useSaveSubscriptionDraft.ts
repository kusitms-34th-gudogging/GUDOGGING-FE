import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RegisterStep } from '@/hooks/useRegisterDraft';
import { type DraftItem, draftKeys } from '@/hooks/useSubscriptionDraft';
import { request } from '@/lib/request';

// 구독 등록 임시저장 (덮어씀, 사용자당 1건)
export const useSaveSubscriptionDraft = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (draft: {
      items: DraftItem[];
      lastStep: RegisterStep;
      editingItemIndex: number | null;
    }) =>
      request<{ savedAt: string }>('/api/v1/subscriptions/drafts', { method: 'PUT', body: draft }),
    onSuccess: () => client.invalidateQueries({ queryKey: draftKeys.all }),
  });
};
