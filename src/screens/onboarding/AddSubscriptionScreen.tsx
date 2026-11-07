import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, Step1Icon, Step2Icon, Step3Icon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
import { GuideItem } from '@/components/onboarding/GuideItem';
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
}

export const AddSubscriptionScreen = ({
  provider,
  onSkip,
  onConfirm,
}: AddSubscriptionScreenProps) => {
  const { title, description, guides, cta } = CONTENT[provider];

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
        onTextActionPress={onSkip}
      />

      <View className="mt-s12 flex-1 gap-s24 px-screen-x">
        <View className="gap-inline-sm">
          <Text className="text-text-primary text-head1-bold">{title}</Text>
          <Text className="text-text-primary text-body2-regular">{description}</Text>
        </View>
        <View className="gap-stack-lg">
          <View className="gap-stack-lg">
            {guides.map((guide) => (
              <GuideItem key={guide.label} {...guide} />
            ))}
          </View>
          <Text className="px-s2 text-text-secondary text-caption2-regular">
            {'지금 등록하지 않아도 괜찮아요.\n[홈 - 구독 등록하기]에서 언제든 추가할 수 있어요.'}
          </Text>
        </View>
      </View>

      <View className="px-screen-x pb-s16">
        <Cta label={cta} onPress={onConfirm} />
      </View>
    </SafeAreaView>
  );
};
