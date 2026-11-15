import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Linking, Text, View } from 'react-native';

import { AlertCircleIcon, Step1Icon, Step2Icon, Step3Icon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { GuideStep } from '@/components/common/GuideStep';
import { Modal } from '@/components/common/Modal';
import { ScreenTitle } from '@/components/common/ScreenTitle';
import { TopBar } from '@/components/common/TopBar';
import { type CancelGuide, DEFAULT_WEB_GUIDE } from '@/constants/cancel';
import { endSubscription } from '@/constants/manage';
import { fillName } from '@/utils/josa';

const STEP_ICONS = [Step1Icon, Step2Icon, Step3Icon];

interface CancelGuideScreenProps {
  subscriptionId: string;
  name: string;
  guide: CancelGuide;
}

// X-01·X-03·X-04·X-05 해지 안내 + X-06 해지 완료 확인 모달
export const CancelGuideScreen = ({ subscriptionId, name, guide }: CancelGuideScreenProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  // 스토어·해지 페이지로 나갔다가 앱으로 돌아오면 모달 자동 노출
  const [awaitingReturn, setAwaitingReturn] = useState(false);

  useEffect(() => {
    if (!awaitingReturn) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      setAwaitingReturn(false);
      setConfirmOpen(true);
    });
    return () => sub.remove();
  }, [awaitingReturn]);

  const onCta = () => {
    // 해지 링크 없음(X-05): '해지했어요'로 바로 모달
    if (!guide.url) return setConfirmOpen(true);
    Linking.openURL(guide.url)
      .then(() => setAwaitingReturn(true))
      .catch(() => {});
  };

  // shortcut: 해지 API 없이 샘플만 구독 종료로 바꿈, 연동 시 구독 종료·해지일 저장·점검 알림 중단 API로 교체
  // 해지를 시작한 구독 상세로 돌아가 구독 종료(M-05)로 표시
  const onComplete = () => {
    endSubscription(subscriptionId);
    router.dismissTo(`/manage/detail/${subscriptionId}`);
  };

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="해지 안내"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-section px-screen-x pt-stack-md">
        <ScreenTitle
          title={`${name} 구독을\n해지할게요.`}
          description={`${name} · ${guide.payment}`}
        />
        <View className="gap-stack-lg">
          {guide.steps ? (
            <View className="gap-stack-md">
              {guide.steps.map((step, i) => (
                <GuideStep
                  key={step}
                  icon={STEP_ICONS[i]}
                  iconClassName="text-icon-primary"
                  label={fillName(step, name)}
                />
              ))}
            </View>
          ) : (
            <Text
              lineBreakStrategyIOS="hangul-word"
              className="text-text-primary text-body2-semibold"
            >
              {fillName(DEFAULT_WEB_GUIDE, name)}
            </Text>
          )}
          {guide.notice && (
            <View className="flex-row items-start gap-inline-sm">
              <View className="py-[2px]">
                <AlertCircleIcon className="size-icon-list text-icon-secondary" />
              </View>
              <Text className="shrink py-[2px] text-text-secondary text-caption2-regular">
                {guide.notice}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta label={guide.cta} onPress={onCta} className="mb-[14px]" />
      </View>
      <Modal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        buttons="both"
        title={fillName('{name}을 해지했나요?', name)}
        description={'해지 완료를 누르면 점검 알림이\n더 이상 오지 않아요.'}
        cancelLabel="취소"
        confirmLabel="해지 완료"
        onConfirm={onComplete}
      />
    </View>
  );
};
