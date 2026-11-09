import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Step1Icon, Step2Icon, Step3Icon } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
import { GuideStep } from '@/components/register/GuideStep';
import { ScreenTitle } from '@/components/register/ScreenTitle';
import { useToast } from '@/hooks/useToast';

// Apple 계정의 전체 구독 목록 (App Store 구독 관리)
const SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

const STEPS = [
  { icon: Step1Icon, text: '버튼을 눌러 구독 관리 화면으로 이동해요' },
  { icon: Step2Icon, text: '구독 목록이 다 보이게 캡처해 주세요' },
  { icon: Step3Icon, text: '돌아와서 스크린샷을 추가해 주세요' },
];

export const RegisterScreenshotGuideScreen = () => {
  const { show } = useToast();
  // 구독 관리 화면을 열고 돌아오면 뒤로가기 + 버튼 2개 상태
  const [opened, setOpened] = useState(false);

  const openSubscriptions = () =>
    Linking.openURL(SUBSCRIPTIONS_URL)
      .then(() => setOpened(true))
      .catch(() => show({ type: 'error', message: '구독 관리 화면을 열 수 없어요.' }));

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="스크린샷으로 등록"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-section px-screen-x pt-stack-md">
        <ScreenTitle
          title={'스크린샷으로\n구독을 가져와요.'}
          description="구독 목록을 캡처하면 구독 정보를 찾아드려요."
        />
        <View className="gap-inset-md">
          <View className="gap-stack-md">
            {STEPS.map(({ icon, text }) => (
              <GuideStep key={text} icon={icon} iconClassName="text-icon-primary" label={text} />
            ))}
          </View>
          <Text className="px-s2 text-text-secondary text-caption2-regular">
            {'지금 등록하지 않아도 괜찮아요.\n[홈 - 구독 등록하기]에서 언제든 추가할 수 있어요.'}
          </Text>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        {opened ? (
          <View className="mb-[14px] flex-row gap-inline-sm">
            <Button
              variant="tonal"
              label="구독 목록 열기"
              onPress={openSubscriptions}
              className="flex-1"
            />
            <Button
              label="스크린샷 등록하기"
              onPress={() => router.push('/register/images')}
              className="flex-1"
            />
          </View>
        ) : (
          <Cta label="스크린샷 찍으러 가기" onPress={openSubscriptions} className="mb-[14px]" />
        )}
      </View>
    </View>
  );
};
