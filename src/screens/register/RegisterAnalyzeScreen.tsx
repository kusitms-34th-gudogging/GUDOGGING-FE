import { router } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { TopBar } from '@/components/common/TopBar';
import { CategoryPullBackground } from '@/components/register/CategoryPullBackground';
import { FOUND_SAMPLE } from '@/constants/services';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';

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
    const timer = setTimeout(() => {
      if (!FOUND_SAMPLE.some((f) => f.issue)) {
        // 실패 화면에서 뒤로가기·스와이프 모두 안내(A-06·A-11)로 가게 사이의 스크린샷 확인(A-07)까지 걷어 냄 (기획 답변)
        router.dismissTo(source === 'gmail' ? '/register/gmail' : '/register/screenshot');
        return router.push({ pathname: '/register/failed', params: { source } });
      }
      // 분석 결과가 나온 시점부터 이어서 등록할 수 있게 저장 (분석 중에 나가면 처음부터)
      // 등록 가능 항목은 처음부터 전부 체크 (기획 답변). 확인 필요 항목도 수정해 등록 가능이 되면 체크된 채로
      useRegisterDraft.getState().setFoundChecked(FOUND_SAMPLE.map((f) => f.id));
      router.replace('/register/found');
    }, MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, source]);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <CategoryPullBackground />
      <TopBar
        variant="detail"
        title={title}
        // shortcut: Gmail 연동 없음, 연동 작업 시 분석 중 뒤로가기면 연동 해제 후 A-11 처음 상태로 (기획 답변)
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <Text className="pt-[341px] text-center text-text-primary text-head3-bold">{message}</Text>
    </View>
  );
};
