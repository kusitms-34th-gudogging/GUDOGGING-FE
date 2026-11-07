import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { CheckIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';

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
    <View className="flex-1 gap-inset-lg px-screen-x pt-stack-md">
      <View className="gap-inline-sm">
        <Text className="text-text-primary text-head1-bold">
          {'결제 메일에서\n구독을 찾아드릴게요.'}
        </Text>
        <Text className="text-text-primary text-body2-regular">
          Gmail 결제 메일에서 등록할 구독을 찾아드려요.
        </Text>
      </View>
      <View className="gap-stack-lg">
        <View className="gap-stack-lg">
          {GUIDES.map((text) => (
            <View key={text} className="flex-row items-start gap-inset-sm">
              <View className="py-px">
                <CheckIcon className="size-icon-list text-icon-brand" />
              </View>
              <Text className="shrink text-text-primary text-body2-semibold">{text}</Text>
            </View>
          ))}
        </View>
        <Text className="px-s2 text-text-secondary text-caption2-regular">
          {'지금 등록하지 않아도 괜찮아요.\n[홈 - 구독 등록하기]에서 언제든 추가할 수 있어요.'}
        </Text>
      </View>
    </View>
    <View className="pb-safe px-screen-x">
      {/* shortcut: Gmail OAuth 없이 바로 메일 확인 중으로, 연동 작업 시 OAuth 성공 후 이동 */}
      <Cta
        label="Gmail 연동하기"
        onPress={() => router.push({ pathname: '/register/analyze', params: { source: 'gmail' } })}
        className="mb-[14px]"
      />
    </View>
  </View>
);
