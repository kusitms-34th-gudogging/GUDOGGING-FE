import { useLocalSearchParams } from 'expo-router';

import { RegisterServiceInputScreen } from '@/screens/RegisterServiceInputScreen';

export default function RegisterServiceInputRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RegisterServiceInputScreen serviceId={id} />;
}
