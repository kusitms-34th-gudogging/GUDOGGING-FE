import { useLocalSearchParams } from 'expo-router';

import { FOUND_SAMPLE } from '@/constants/services';
import { RegisterServiceInputScreen } from '@/screens/RegisterServiceInputScreen';

export default function RegisterServiceInputRoute() {
  const { id, ids, found } = useLocalSearchParams<{ id?: string; ids?: string; found?: string }>();
  return (
    <RegisterServiceInputScreen
      serviceId={id}
      selectedIds={ids}
      found={found ? FOUND_SAMPLE.find((f) => f.id === id) : undefined}
    />
  );
}
