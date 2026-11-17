import { useLocalSearchParams } from 'expo-router';

import { RegisterAnalyzeScreen } from '@/screens/register/RegisterAnalyzeScreen';

export default function RegisterAnalyzeRoute() {
  // images: 고른 스크린샷 uri 목록(JSON). Gmail은 없음
  const { source, images } = useLocalSearchParams<{ source?: string; images?: string }>();
  return (
    <RegisterAnalyzeScreen
      source={source === 'gmail' ? 'gmail' : 'screenshot'}
      images={images ? (JSON.parse(images) as string[]) : []}
    />
  );
}
