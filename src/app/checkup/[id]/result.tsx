import { useLocalSearchParams } from 'expo-router';

import { CheckupResultScreen } from '@/screens/checkup/CheckupResultScreen';

export default function CheckupResultRoute() {
  // checkupId: 점검 제출 응답으로 받은 점검 id
  const { checkupId } = useLocalSearchParams<{ id: string; checkupId: string }>();
  return <CheckupResultScreen checkupId={checkupId} />;
}
