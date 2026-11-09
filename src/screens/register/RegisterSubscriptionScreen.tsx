import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  CheckColorAsset,
  CheckMonoAsset,
  ImageColorAsset,
  ImageMonoAsset,
  MailColorAsset,
  MailMonoAsset,
} from '@/assets/graphics';
import { Modal } from '@/components/common/Modal';
import { OptionCard } from '@/components/common/OptionCard';
import { TopBar } from '@/components/common/TopBar';
import { ScreenTitle } from '@/components/register/ScreenTitle';
import { hasRegisterDraft, useRegisterDraft } from '@/hooks/useRegisterDraft';

export type RegisterMethod = 'screenshot' | 'gmail' | 'manual';

const METHODS = [
  {
    method: 'screenshot',
    title: '스크린샷으로 등록',
    description: '구독 목록을 캡처해 한 번에 불러와요.',
    asset: ImageColorAsset,
    monoAsset: ImageMonoAsset,
  },
  {
    method: 'gmail',
    title: 'Gmail에서 불러오기',
    description: '결제 메일에서 구독 정보를 찾아요.',
    asset: MailColorAsset,
    monoAsset: MailMonoAsset,
  },
  {
    method: 'manual',
    title: '직접 등록하기',
    description: '서비스와 결제 정보를 직접 입력해요.',
    asset: CheckColorAsset,
    monoAsset: CheckMonoAsset,
  },
] as const;

const FIRST_SCREEN = {
  screenshot: '/register/screenshot',
  gmail: '/register/gmail',
  manual: '/register/select',
} as const satisfies Record<RegisterMethod, string>;

const hasDraft = () => hasRegisterDraft(useRegisterDraft.getState());

// 등록 중이던 화면으로 이어감. 스크린샷·Gmail은 분석 결과(A-09), 직접 등록은 선택한 구독(A-04)
const resume = () => {
  router.push(useRegisterDraft.getState().foundChecked ? '/register/found' : '/register/selected');
};

export const RegisterSubscriptionScreen = () => {
  const [selected, setSelected] = useState<RegisterMethod>();
  // 선택 표시는 누른 순간 반응용. 다음 화면에서 돌아오면 풀어 둠
  useFocusEffect(useCallback(() => setSelected(undefined), []));
  // 들어올 때 등록 중이던 구독이 있으면 불러오기 팝업(A-01s). 저장소를 다 읽은 뒤에 판단
  const [askResume, setAskResume] = useState(
    () => useRegisterDraft.persist.hasHydrated() && hasDraft(),
  );
  useEffect(() => useRegisterDraft.persist.onFinishHydration(() => setAskResume(hasDraft())), []);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 추가"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="gap-section px-screen-x pt-stack-md">
        <ScreenTitle
          title={'어떤 방법으로\n구독을 등록할까요?'}
          description="편한 방법을 선택해 주세요."
        />
        <View className="gap-stack-md">
          {METHODS.map(({ method, ...card }) => (
            <OptionCard
              key={method}
              {...card}
              selected={selected === method}
              onSelect={() => {
                setSelected(method);
                router.push(FIRST_SCREEN[method]);
              }}
            />
          ))}
        </View>
      </View>
      <Modal
        visible={askResume}
        onClose={() => setAskResume(false)}
        buttons="both"
        title="등록 중이던 구독을 불러올까요?"
        cancelLabel="새로 등록하기"
        onCancel={() => useRegisterDraft.getState().reset()}
        confirmLabel="불러오기"
        onConfirm={resume}
      />
    </View>
  );
};
