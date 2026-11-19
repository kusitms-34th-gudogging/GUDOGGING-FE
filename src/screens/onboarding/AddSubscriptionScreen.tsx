import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, Step1Icon, Step2Icon, Step3Icon } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { Cta } from '@/components/common/Cta';
import { GuideStep } from '@/components/common/GuideStep';
import { ScreenTitle } from '@/components/common/ScreenTitle';
import { Text } from '@/components/common/Text';
import { TopBar } from '@/components/common/TopBar';
import type { LoginProvider } from '@/types/auth';

// Apple 로그인은 스크린샷 안내(O-04), Google 로그인은 Gmail 연동 안내(O-05)
const CONTENT = {
  apple: {
    title: '스크린샷으로\n구독을 가져와요.',
    description: '구독 목록을 캡처하면 구독 정보를 찾아드려요.',
    guides: [
      {
        icon: Step1Icon,
        iconClassName: 'text-icon-primary',
        label: '버튼을 눌러 구독 관리 화면으로 이동해요',
      },
      {
        icon: Step2Icon,
        iconClassName: 'text-icon-primary',
        label: '구독 목록이 다 보이게 캡처해 주세요',
      },
      {
        icon: Step3Icon,
        iconClassName: 'text-icon-primary',
        label: '돌아와서 스크린샷을 추가해 주세요',
      },
    ],
    cta: '스크린샷 찍으러 가기',
  },
  google: {
    title: '결제 메일에서\n구독을 찾아드릴게요.',
    description: 'Gmail 결제 메일에서 등록할 구독을 찾아드려요.',
    guides: [
      { icon: CheckIcon, iconClassName: 'text-icon-brand', label: 'Gmail 연결은 선택 사항이에요.' },
      {
        icon: CheckIcon,
        iconClassName: 'text-icon-brand',
        label: '마이페이지에서 연결 상태를 관리할 수 있어요.',
      },
      {
        icon: CheckIcon,
        iconClassName: 'text-icon-brand',
        label: '로그인 계정과 Gmail 연동 계정은 별도로 관리돼요.',
      },
    ],
    cta: 'Gmail 연동하기',
  },
} as const;

interface AddSubscriptionScreenProps {
  provider: LoginProvider;
  /** 건너뛰기: 구독 등록 단계를 생략하고 구독 관리 화면으로 */
  onSkip?: () => void;
  /** 하단 CTA: Apple은 App Store 구독 관리, Google은 Gmail 연동 */
  onConfirm?: () => void;
  /** Apple: 구독 관리를 열고 돌아온 뒤 스크린샷 고르기로 (A-06과 같은 두 버튼 상태) */
  onAddScreenshots?: () => void;
}

export const AddSubscriptionScreen = ({
  provider,
  onSkip,
  onConfirm,
  onAddScreenshots,
}: AddSubscriptionScreenProps) => {
  const { title, description, guides, cta } = CONTENT[provider];
  // 구독 관리를 한 번 열었으면 다시 열기 + 스크린샷 등록하기 (A-06과 같음)
  const [opened, setOpened] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 추가하기"
        showBack={false}
        showAction1={false}
        showAction2={false}
        showTextAction
        textAction="건너뛰기"
        textActionTestID="add-subscription-skip"
        onTextActionPress={onSkip}
      />

      <View className="mt-s12 flex-1 gap-section px-screen-x">
        <ScreenTitle title={title} description={description} />
        <View className="gap-stack-lg">
          <View className="gap-stack-md">
            {guides.map((guide) => (
              <GuideStep key={guide.label} {...guide} />
            ))}
          </View>
          <Text className="px-s2 text-text-secondary text-caption2-regular">
            {'지금 등록하지 않아도 괜찮아요.\n[홈 - 구독 등록하기]에서 언제든 추가할 수 있어요.'}
          </Text>
        </View>
      </View>

      <View className="px-screen-x">
        {opened && onAddScreenshots ? (
          <View className="mb-[14px] flex-row gap-inline-sm">
            <Button variant="tonal" label="구독 목록 열기" onPress={onConfirm} className="flex-1" />
            <Button label="스크린샷 등록하기" onPress={onAddScreenshots} className="flex-1" />
          </View>
        ) : (
          <Cta
            label={cta}
            onPress={() => {
              onConfirm?.();
              setOpened(true);
            }}
            className="mb-[14px]"
          />
        )}
      </View>
    </SafeAreaView>
  );
};
