import { useLocalSearchParams } from 'expo-router';

import { CheckupScreen } from '@/screens/checkup/CheckupScreen';

export default function CheckupRoute() {
  const { id, restart } = useLocalSearchParams<{ id: string; restart?: string }>();
  return <CheckupScreen id={id} restart={!!restart} />;
}
