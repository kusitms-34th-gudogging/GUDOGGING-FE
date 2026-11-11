import { useLocalSearchParams } from 'expo-router';

import { CHECKUP_SAMPLE } from '@/constants/checkup';
import { CheckupScreen } from '@/screens/checkup/CheckupScreen';

export default function CheckupRoute() {
  const { id, restart } = useLocalSearchParams<{ id: string; restart?: string }>();
  // shortcut: 샘플에서 찾음, 구독 조회 API 연동 시 훅으로 교체
  const subscription = CHECKUP_SAMPLE.find((s) => s.id === id);
  return subscription ? <CheckupScreen subscription={subscription} restart={!!restart} /> : null;
}
