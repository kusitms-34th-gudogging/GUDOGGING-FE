import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useReducer } from 'react';

import { MANAGE_SAMPLE } from '@/constants/manage';
import { EndedSubscriptionDetailScreen } from '@/screens/manage/EndedSubscriptionDetailScreen';
import { SubscriptionDetailScreen } from '@/screens/manage/SubscriptionDetailScreen';

export default function SubscriptionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // shortcut: 해지 완료(endSubscription)로 바뀐 샘플을 돌아왔을 때 다시 읽도록 포커스마다 리렌더, 상세 API 연동 시 삭제
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useFocusEffect(useCallback(() => rerender(), []));
  // shortcut: 샘플에서 찾음, 구독 상세 API 연동 시 훅으로 교체
  const subscription = MANAGE_SAMPLE.find((s) => s.id === id);
  if (!subscription) return null;
  // 같은 id라도 해지되면 지난 구독(M-05) 화면
  return subscription.status === 'ended' ? (
    <EndedSubscriptionDetailScreen subscription={subscription} />
  ) : (
    <SubscriptionDetailScreen subscription={subscription} />
  );
}
