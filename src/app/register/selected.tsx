import { useLocalSearchParams } from 'expo-router';

import { RegisterSelectedServiceScreen } from '@/screens/register/RegisterSelectedServiceScreen';

export default function RegisterSelectedServiceRoute() {
  const { more } = useLocalSearchParams<{ more?: string }>();
  return <RegisterSelectedServiceScreen more={!!more} />;
}
