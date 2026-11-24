import { router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';

import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
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
  // Gmail이면 A-11에서 받은 Google 인증 코드
  authCode?: string;
}
const MIN_VISIBLE_MS = 1500;

export const RegisterAnalyzeScreen = ({
  source,
  images = [],
  authCode = '',
}: RegisterAnalyzeScreenProps) => {
  const { title, message } = COPY[source];
  const screenshots = useAnalyzeScreenshots();
  const gmail = useAnalyzeGmail();
  const navigation = useNavigation();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
    let left = false;
    const done = (found: FoundSubscription[]) => {
      // 찾은 구독이 없으면 인식 실패(A-08e·A-12e)로
      if (found.length === 0) {
        // 온보딩은 구독 추가(A-01) 없이 들어오므로 실패 화면만 남겨, 스와이프도 첫 등록 화면(Apple O-04·Google O-05)으로 (QA)
        const state = navigation.getState();
        if (state && !state.routes.some((r) => r.name === 'index'))
          // router.dismissAll·replace는 등록 스택에 화면이 하나뿐이면 온보딩까지 건드려서 등록 스택만 다시 만듦
          return navigation.dispatch({
            type: 'RESET',
            payload: {
              ...state,
              index: 0,
              routes: [{ key: `failed-${source}`, name: 'failed', params: { source } }],
            },
          });
        // 실패 화면에서 뒤로가기·스와이프 모두 스크린샷 확인(A-07)·Gmail 안내(A-11)로 (화면설계서 A-08e·A-12e)
        router.dismissTo(source === 'gmail' ? '/register/gmail' : '/register/images');
        return router.push({ pathname: '/register/failed', params: { source } });
      }
      // 분석 결과가 나온 시점부터 이어서 등록할 수 있게 저장 (분석 중에 나가면 처음부터)
      useRegisterDraft.getState().setFound(source === 'gmail' ? 'GMAIL' : 'SCREENSHOT', found);
      router.replace('/register/found');
    };
    // 분석 응답과 최소 노출 시간(1.5초) 중 늦은 쪽에 이동
    // 분석 중에 나가면 요청을 취소하고 결과를 버림. Gmail 연결은 그대로 둠 (화면설계서 A-12 '작업 중단')
    const controller = new AbortController();
    const { signal } = controller;
    const minVisible = new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS));
    const analysis =
      source === 'gmail'
        ? gmail.mutateAsync({ authCode, signal })
        : screenshots.mutateAsync({ uris: images, signal });
    Promise.all([analysis, minVisible])
      .then(([found]) => !left && done(found as FoundSubscription[]))
      // 읽기 실패·연동 실패도 인식 실패 안내로. 개발 중엔 원인을 Metro에 남김
      .catch((error: unknown) => {
        if (__DEV__) console.warn('구독 분석 실패', error);
        if (!left) done([]);
      });

    return () => {
      left = true;
      controller.abort();
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
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <ToastOutlet placement="bottom" />
    </View>
  );
};
