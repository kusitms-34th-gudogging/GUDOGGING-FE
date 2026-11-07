import { router } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { TopBar } from '@/components/common/TopBar';
import { CategoryPullBackground } from '@/components/register/CategoryPullBackground';
import { FOUND_SAMPLE } from '@/constants/services';

const COPY = {
  screenshot: { title: '구독 정보 확인 중', message: '구독 정보를 찾고 있어요.' },
  gmail: { title: '결제 메일 확인 중', message: '구독 결제 메일을\n확인하고 있어요.' },
};

interface RegisterAnalyzeScreenProps {
  source: keyof typeof COPY;
}
const MIN_VISIBLE_MS = 1500;

export const RegisterAnalyzeScreen = ({ source }: RegisterAnalyzeScreenProps) => {
  const { title, message } = COPY[source];

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
    // shortcut: 분석 API 없이 최소 노출 시간 1.5초 뒤 이동, API 연동 시 응답과 1.5초 중 늦은 쪽에 이동
    // 확인 필요 항목이 없으면 인식 실패(A-08e)로
    const timer = setTimeout(
      () =>
        FOUND_SAMPLE.some((f) => f.issue)
          ? router.replace('/register/found')
          : router.replace({ pathname: '/register/failed', params: { source } }),
      MIN_VISIBLE_MS,
    );
    return () => clearTimeout(timer);
  }, [message, source]);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <CategoryPullBackground />
      <TopBar
        variant="detail"
        title={title}
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <Text className="pt-[341px] text-center text-text-primary text-head3-bold">{message}</Text>
    </View>
  );
};
