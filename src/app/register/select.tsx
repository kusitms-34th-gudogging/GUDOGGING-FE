import { useLocalSearchParams } from 'expo-router';

import { RegisterServiceSelectScreen } from '@/screens/register/RegisterServiceSelectScreen';

export default function RegisterServiceSelectRoute() {
  const { more } = useLocalSearchParams<{ more?: string }>();
  return <RegisterServiceSelectScreen more={!!more} />;
}
