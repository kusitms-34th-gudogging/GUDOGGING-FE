import { useLocalSearchParams } from 'expo-router';

import { RegisterAnalyzeScreen } from '@/screens/register/RegisterAnalyzeScreen';

export default function RegisterAnalyzeRoute() {
  // images: 고른 스크린샷 uri 목록(JSON). authCode: Gmail 연동용 Google 인증 코드
  const { source, images, authCode } = useLocalSearchParams<{
    source?: string;
    images?: string;
    authCode?: string;
  }>();
  return (
    <RegisterAnalyzeScreen
      source={source === 'gmail' ? 'gmail' : 'screenshot'}
      images={images ? (JSON.parse(images) as string[]) : []}
      authCode={authCode}
    />
  );
}
