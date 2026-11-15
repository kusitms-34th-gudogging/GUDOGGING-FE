import { useLocalSearchParams } from 'expo-router';

import { getCancelGuide } from '@/constants/cancel';
import { CHECKUP_SAMPLE } from '@/constants/checkup';
import { MANAGE_SAMPLE } from '@/constants/manage';
import { CancelGuideScreen } from '@/screens/cancel/CancelGuideScreen';

export default function CancelGuideRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // shortcut: 샘플에서 찾음, 구독 상세 API 연동 시 훅으로 교체
  const subscription = MANAGE_SAMPLE.find((s) => s.id === id);
  if (!subscription) return null;
  // 문구 속 이름은 한글명 우선 (Netflix → 넷플릭스)
  const name = CHECKUP_SAMPLE.find((s) => s.id === id)?.nameKo ?? subscription.name;
  return (
    <CancelGuideScreen
      subscriptionId={subscription.id}
      name={name}
      guide={getCancelGuide(subscription.id, subscription.paidAt)}
    />
  );
}
