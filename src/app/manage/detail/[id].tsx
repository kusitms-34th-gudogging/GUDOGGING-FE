import { useLocalSearchParams } from 'expo-router';

import { MANAGE_SAMPLE } from '@/constants/manage';
import { EndedSubscriptionDetailScreen } from '@/screens/manage/EndedSubscriptionDetailScreen';
import { SubscriptionDetailScreen } from '@/screens/manage/SubscriptionDetailScreen';

export default function SubscriptionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
