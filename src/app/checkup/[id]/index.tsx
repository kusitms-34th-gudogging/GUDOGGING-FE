import { useLocalSearchParams } from 'expo-router';

import { CheckupScreen } from '@/screens/checkup/CheckupScreen';

export default function CheckupRoute() {
  const { id, restart, from } = useLocalSearchParams<{
    id: string;
    restart?: string;
    from?: string;
  }>();
  return (
    <CheckupScreen
      id={id}
      restart={!!restart}
      from={from === 'push' || from === 'home' ? from : 'detail'}
    />
  );
}
