import { useLocalSearchParams } from 'expo-router';

import { RegisterSubscriptionScreen } from '@/screens/register/RegisterSubscriptionScreen';

export default function RegisterSubscriptionRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  return <RegisterSubscriptionScreen from={from === 'list' ? 'list' : 'home'} />;
}
