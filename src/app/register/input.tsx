import { useLocalSearchParams } from 'expo-router';

import { FOUND_SAMPLE } from '@/constants/services';
import { RegisterServiceInputScreen } from '@/screens/register/RegisterServiceInputScreen';

export default function RegisterServiceInputRoute() {
  const { id, found, more } = useLocalSearchParams<{
    id?: string;
    found?: string;
    more?: string;
  }>();
  return (
    <RegisterServiceInputScreen
      serviceId={id}
      found={found ? FOUND_SAMPLE.find((f) => f.id === id) : undefined}
      more={!!more}
    />
  );
}
