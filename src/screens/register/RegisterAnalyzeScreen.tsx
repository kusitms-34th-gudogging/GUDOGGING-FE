import { router } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';

import { Text } from '@/components/common/Text';
import { TopBar } from '@/components/common/TopBar';
import { CategoryPullBackground } from '@/components/register/CategoryPullBackground';
import type { FoundSubscription } from '@/constants/services';
import { useAnalyzeGmail, useAnalyzeScreenshots } from '@/hooks/useAnalyzeSubscriptions';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';

const COPY = {
  screenshot: { title: '구독 정보 확인 중', message: '구독 정보를 찾고 있어요.' },
  gmail: { title: '결제 메일 확인 중', message: '구독 결제 메일을\n확인하고 있어요.' },
};

interface RegisterAnalyzeScreenProps {
  source: keyof typeof COPY;
  // 스크린샷 분석이면 고른 이미지 (A-07)
  images?: string[];
}
const MIN_VISIBLE_MS = 1500;

export const RegisterAnalyzeScreen = ({ source, images = [] }: RegisterAnalyzeScreenProps) => {
  const { title, message } = COPY[source];
  const screenshots = useAnalyzeScreenshots();
  const gmail = useAnalyzeGmail();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
    let left = false;
    const done = (found: FoundSubscription[]) => {
      // 찾은 구독이 없으면 인식 실패(A-08e·A-12e)로
      if (found.length === 0) {
        // 실패 화면에서 뒤로가기·스와이프 모두 안내(A-06·A-11)로 가게 사이의 스크린샷 확인(A-07)까지 걷어 냄 (기획 답변)
        router.dismissTo(source === 'gmail' ? '/register/gmail' : '/register/screenshot');
        return router.push({ pathname: '/register/failed', params: { source } });
      }
      // 분석 결과가 나온 시점부터 이어서 등록할 수 있게 저장 (분석 중에 나가면 처음부터)
      useRegisterDraft.getState().setFound(source === 'gmail' ? 'GMAIL' : 'SCREENSHOT', found);
      router.replace('/register/found');
    };
    // 분석 응답과 최소 노출 시간(1.5초) 중 늦은 쪽에 이동. 분석 중에 나가면 결과를 버림
    const minVisible = new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS));
    const analysis = source === 'gmail' ? gmail.mutateAsync() : screenshots.mutateAsync(images);
    Promise.all([analysis, minVisible])
      .then(([found]) => !left && done(found as FoundSubscription[]))
      // 읽기 실패·연동 실패도 인식 실패 안내로. 개발 중엔 원인을 Metro에 남김
      .catch((error: unknown) => {
        if (__DEV__) console.warn('구독 분석 실패', error);
        if (!left) done([]);
      });

    return () => {
      left = true;
    };
    // 화면에 들어올 때 한 번만 분석
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      {/* 돋보기 + 문구 묶음을 기기 높이와 관계없이 화면 세로 가운데에. 배경 Lottie는 돋보기 자리에 맞춰 깔림 */}
      <View pointerEvents="box-none" className="absolute inset-0 items-center justify-center">
        <View className="items-center gap-s20">
          <View className="size-[104px]">
            <CategoryPullBackground />
          </View>
          <Text className="text-center text-text-primary text-head3-bold">{message}</Text>
        </View>
      </View>
      <TopBar
        variant="detail"
        title={title}
        // shortcut: 분석 중 뒤로가기면 Gmail 연동 해제 후 A-11 처음 상태로 (기획 답변), 마이페이지 Gmail 해제 연결 때 같은 훅으로
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
    </View>
  );
};
