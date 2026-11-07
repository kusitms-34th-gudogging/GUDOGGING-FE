import { useLocalSearchParams } from 'expo-router';

import { RegisterAnalyzeScreen } from '@/screens/RegisterAnalyzeScreen';

export default function RegisterAnalyzeRoute() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  return <RegisterAnalyzeScreen source={source === 'gmail' ? 'gmail' : 'screenshot'} />;
}
