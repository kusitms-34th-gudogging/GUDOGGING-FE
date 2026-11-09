import { useLocalSearchParams } from 'expo-router';

import { CHECKUP_SAMPLE } from '@/constants/checkup';
import { CheckupCancelScreen } from '@/screens/checkup/CheckupCancelScreen';

export default function CheckupCancelRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // shortcut: 샘플에서 찾음, 구독 조회 API 연동 시 훅으로 교체
  const subscription = CHECKUP_SAMPLE.find((s) => s.id === id);
  return subscription ? <CheckupCancelScreen subscription={subscription} /> : null;
}
