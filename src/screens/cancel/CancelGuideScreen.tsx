import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Linking, View } from 'react-native';

import { AlertCircleIcon, Step1Icon, Step2Icon, Step3Icon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { GuideStep } from '@/components/common/GuideStep';
import { Modal } from '@/components/common/Modal';
import { QueryState } from '@/components/common/QueryState';
import { ScreenTitle } from '@/components/common/ScreenTitle';
import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { useCancelGuide } from '@/hooks/useCancelGuide';
import { useCancelSubscription } from '@/hooks/useCancelSubscription';
import { useToast } from '@/hooks/useToast';
import { fillName } from '@/utils/josa';

const STEP_ICONS = [Step1Icon, Step2Icon, Step3Icon];

interface CancelGuideScreenProps {
  subscriptionId: string;
}

// X-01·X-03·X-04·X-05 해지 안내 + X-06 해지 완료 확인 모달
export const CancelGuideScreen = ({ subscriptionId }: CancelGuideScreenProps) => {
  const { data: guide, isError, refetch } = useCancelGuide(subscriptionId);
  const cancelSubscription = useCancelSubscription();
  const { show } = useToast();
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

  if (!guide) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={isError} onRetry={refetch} />
        <ToastOutlet placement="bottom" />
      </View>
    );
  }
  const { name } = guide;

  const onCta = () => {
    // 해지 링크 없음(X-05): '해지했어요'로 바로 모달
    if (!guide.url) return setConfirmOpen(true);
    Linking.openURL(guide.url)
      .then(() => setAwaitingReturn(true))
      .catch(() => show({ type: 'error', message: '페이지를 열지 못했어요' }));
  };

  // 해지 완료 처리(구독 종료·해지일 저장·점검 알림 중단) 후 해지를 시작한 구독 상세로. 상세는 구독 종료(M-05)로 바뀜
  const onComplete = () =>
    cancelSubscription.mutate(subscriptionId, {
      onSuccess: () => {
        router.dismissTo(`/manage/detail/${subscriptionId}`);
        show(
          { type: 'success', message: fillName('{name}을 해지했어요', name) },
          { nextScreen: true },
        );
      },
      onError: () => show({ type: 'error', message: '저장하지 못했어요' }),
    });

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
        {/* 페이지 열기·해지 완료 실패 토스트는 CTA 위 */}
        <ToastOutlet className="bottom-0 pb-stack-sm" />
      </View>
      <View className="pb-safe px-screen-x">
        <Cta testID="cancel-guide-cta" label={guide.cta} onPress={onCta} className="mb-[14px]" />
      </View>
      <Modal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        buttons="both"
        title={fillName('{name}을 해지했나요?', name)}
        description={'해지 완료를 누르면 점검 알림이\n더 이상 오지 않아요.'}
        cancelLabel="취소"
        confirmLabel="해지 완료"
        confirmTestID="cancel-guide-complete"
        onConfirm={onComplete}
      />
    </View>
  );
};
