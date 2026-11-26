import { useLocalSearchParams } from 'expo-router';

import { CheckupScreen } from '@/screens/checkup/CheckupScreen';

export default function CheckupRoute() {
  const { id, from } = useLocalSearchParams<{
    id: string;
    from?: string;
  }>();
  return <CheckupScreen id={id} from={from === 'push' || from === 'home' ? from : 'detail'} />;
}
