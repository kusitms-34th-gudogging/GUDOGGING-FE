import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Step1Icon, Step2Icon, Step3Icon } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
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
  // 구독 관리 화면을 한 번 열고 나면 뒤로가기 + 버튼 2개 상태로 바뀜
  const [opened, setOpened] = useState(false);

  const openSubscriptions = () =>
    Linking.openURL(SUBSCRIPTIONS_URL)
      .then(() => setOpened(true))
      .catch(() => show({ type: 'error', message: '구독 관리 화면을 열 수 없어요.' }));

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      {/* shortcut: 온보딩 진입 화면(건너뛰기, 뒤로가기 없음) 기준, A-01에서 들어오는 버전은 디자인 받으면 분기 */}
      <TopBar
        variant="detail"
        title="스크린샷으로 등록"
        showBack={opened}
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
        showTextAction={!opened}
        textAction="건너뛰기"
        // TODO: 온보딩(O-03 이후) 다음 화면 정해지면 연결
        onTextActionPress={() => {}}
      />
      <View className="flex-1 gap-inset-lg px-screen-x pt-stack-md">
        <View className="gap-inline-sm">
          <Text className="text-text-primary text-head1-bold">
            {'스크린샷으로\n구독을 가져와요.'}
          </Text>
          <Text className="text-text-primary text-body2-regular">
            구독 목록을 캡처하면 구독 정보를 찾아드려요.
          </Text>
        </View>
        <View className="gap-inset-md">
          <View className="gap-inset-md">
            {STEPS.map(({ icon: Icon, text }) => (
              <View key={text} className="flex-row items-start gap-inset-sm">
                <View className="py-px">
                  <Icon className="size-icon-list text-icon-primary" />
                </View>
                <Text className="text-text-primary text-body2-semibold">{text}</Text>
              </View>
            ))}
          </View>
          <Text className="px-[2px] text-text-secondary text-caption2-regular">
            {'지금 등록하지 않아도 괜찮아요.\n[홈 - 구독 등록하기]에서 언제든 추가할 수 있어요.'}
          </Text>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        {opened ? (
          <View className="mb-[14px] flex-row gap-inline-sm">
            <Button variant="tonal" label="구독 목록 열기" onPress={openSubscriptions} />
            {/* TODO: A-07 이미지 업로드 화면 생기면 연결 */}
            <Button label="스크린샷 등록하기" className="flex-1" />
          </View>
        ) : (
          <Cta label="스크린샷 찍으러 가기" onPress={openSubscriptions} className="mb-[14px]" />
        )}
      </View>
    </View>
  );
};
