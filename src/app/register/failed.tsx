import { useLocalSearchParams } from 'expo-router';

import { RegisterFailedScreen } from '@/screens/RegisterFailedScreen';

export default function RegisterFailedRoute() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  return <RegisterFailedScreen source={source === 'gmail' ? 'gmail' : 'screenshot'} />;
}
