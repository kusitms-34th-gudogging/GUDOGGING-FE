import { useLocalSearchParams } from 'expo-router';

import { RegisterDoneScreen } from '@/screens/register/RegisterDoneScreen';

export default function RegisterDoneRoute() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  return <RegisterDoneScreen serviceIds={ids ? ids.split(',') : []} />;
}
