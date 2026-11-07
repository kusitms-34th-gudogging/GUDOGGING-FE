import { useLocalSearchParams } from 'expo-router';

import { RegisterServiceInputScreen } from '@/screens/RegisterServiceInputScreen';

export default function RegisterServiceInputRoute() {
  const { id, ids } = useLocalSearchParams<{ id?: string; ids?: string }>();
  return <RegisterServiceInputScreen serviceId={id} selectedIds={ids} />;
}
