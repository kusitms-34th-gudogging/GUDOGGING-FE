import { router } from 'expo-router';
import { View } from 'react-native';

import { CheckIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { GuideStep } from '@/components/common/GuideStep';
import { ScreenTitle } from '@/components/common/ScreenTitle';
import { Text } from '@/components/common/Text';
import { TopBar } from '@/components/common/TopBar';
import { startGmailAnalysis } from '@/hooks/useAnalyzeSubscriptions';

const GUIDES = [
  'Gmail 연결은 선택 사항이에요.',
  '마이페이지에서 연결 상태를 관리할 수 있어요.',
  '로그인 계정과 Gmail 연동 계정은 별도로 관리돼요.',
];

export const RegisterGmailGuideScreen = () => (
  <View className="pt-safe flex-1 bg-bg-default">
    <TopBar
      variant="detail"
      title="Gmail에서 불러오기"
      onBack={() => router.back()}
      showAction1={false}
      showAction2={false}
    />
    <View className="flex-1 gap-section px-screen-x pt-stack-md">
      <ScreenTitle
        title={'결제 메일에서\n구독을 찾아드릴게요.'}
        description="Gmail 결제 메일에서 등록할 구독을 찾아드려요."
      />
      <View className="gap-stack-lg">
        <View className="gap-stack-md">
          {GUIDES.map((text) => (
            <GuideStep key={text} icon={CheckIcon} iconClassName="text-icon-brand" label={text} />
          ))}
        </View>
        <Text className="px-s2 text-text-secondary text-caption2-regular">
          {'지금 등록하지 않아도 괜찮아요.\n[홈 - 구독 등록하기]에서 언제든 추가할 수 있어요.'}
        </Text>
      </View>
    </View>
    <View className="pb-safe px-screen-x">
      <Cta label="Gmail 연동하기" onPress={startGmailAnalysis} className="mb-[14px]" />
    </View>
  </View>
);
