import { useLocalSearchParams } from 'expo-router';

import { RegisterSelectedServiceScreen } from '@/screens/RegisterSelectedServiceScreen';

export default function RegisterSelectedServiceRoute() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  return <RegisterSelectedServiceScreen serviceIds={ids ? ids.split(',') : []} />;
}
