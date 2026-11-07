import { useLocalSearchParams } from 'expo-router';

import { FOUND_SAMPLE } from '@/constants/services';
import { RegisterServiceInputScreen } from '@/screens/RegisterServiceInputScreen';

export default function RegisterServiceInputRoute() {
  const { id, found } = useLocalSearchParams<{ id?: string; found?: string }>();
  return (
    <RegisterServiceInputScreen
      serviceId={id}
      found={found ? FOUND_SAMPLE.find((f) => f.id === id) : undefined}
    />
  );
}
