import { useLocalSearchParams } from 'expo-router';

import { CheckupCancelScreen } from '@/screens/checkup/CheckupCancelScreen';

export default function CheckupCancelRoute() {
  const { id, checkupId } = useLocalSearchParams<{ id: string; checkupId?: string }>();
  return <CheckupCancelScreen id={id} checkupId={checkupId} />;
}
