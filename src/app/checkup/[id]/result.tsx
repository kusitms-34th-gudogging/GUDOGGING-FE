import { useLocalSearchParams } from 'expo-router';

import { CHECKUP_RECOMMEND_SAMPLE, CHECKUP_SAMPLE } from '@/constants/checkup';
import { MANAGE_SAMPLE } from '@/constants/manage';
import { CheckupResultScreen } from '@/screens/checkup/CheckupResultScreen';

export default function CheckupResultRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // shortcut: 샘플에서 찾음, 구독 조회·추천 API 연동 시 훅으로 교체
  const subscription = CHECKUP_SAMPLE.find((s) => s.id === id);
  if (!subscription) return null;

  const sameCategory = MANAGE_SAMPLE.filter(
    (s) => s.status === 'active' && s.category === subscription.category,
  );
  const categorySubscriptions = sameCategory.some((s) => s.id === subscription.id)
    ? sameCategory
    : [...sameCategory, { ...subscription, cycle: 1, unit: '개월' as const }];

  return (
    <CheckupResultScreen
      subscription={subscription}
      categorySubscriptions={categorySubscriptions}
      recommendations={CHECKUP_RECOMMEND_SAMPLE[subscription.id] ?? []}
    />
  );
}
