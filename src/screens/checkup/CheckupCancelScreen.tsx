import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  Text,
  View,
} from 'react-native';

import { Cta } from '@/components/common/Cta';
import { OptionCard } from '@/components/common/OptionCard';
import { TextArea } from '@/components/common/TextArea';
import { TopBar } from '@/components/common/TopBar';
import {
  CHECKUP_CATEGORIES,
  type CheckupSubscription,
  toCheckupCategory,
} from '@/constants/checkup';
import { fillName } from '@/utils/josa';

const CUSTOM_MAX = 100;

interface CheckupCancelScreenProps {
  subscription: CheckupSubscription;
}

// K-90 해지 이유 (복수 선택 + 직접 입력)
export const CheckupCancelScreen = ({ subscription }: CheckupCancelScreenProps) => {
  const { name, nameKo = name } = subscription;
  const reasons = CHECKUP_CATEGORIES[toCheckupCategory(subscription.category)].cancelReasons;
  const [picked, setPicked] = useState<string[]>([]);
  const [customOn, setCustomOn] = useState(false);
  const [custom, setCustom] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);

  const toggle = (reason: string) =>
    setPicked((p) => (p.includes(reason) ? p.filter((r) => r !== reason) : [...p, reason]));
  // 선택지 1개 이상 또는 직접 입력 내용이 있으면 활성화 (공백만은 빈 값)
  const canSubmit = picked.length > 0 || (customOn && custom.trim() !== '');

  // ponytail: 결제 경로별 해지 안내(X-01·X-03·X-04)와 이유 저장 API가 생기면 연결. 건너뛰기는 이유 없이 같은 곳으로
  const goGuide = () => {};

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 점검"
        // 점검 결과(K-80)로
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
        showTextAction
        textAction="건너뛰기"
        onTextActionPress={goGuide}
      />
      {/* 직접 입력 중엔 선택지 영역이 키보드 위까지 줄어들고, 입력란이 보이게 끝으로 스크롤 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 gap-stack-lg px-screen-x pt-stack-md"
      >
        <View className="flex-row items-center gap-inline-md">
          <Image
            source={require('@/assets/images/logo_placeholder.png')}
            className="size-logo-card rounded-full"
          />
          <Text className="text-text-primary text-body2-semibold">{name}</Text>
        </View>
        <View className="shrink gap-inset-lg">
          <View className="max-w-[308px] gap-[6px]">
            <Text
              accessibilityRole="header"
              lineBreakStrategyIOS="hangul-word"
              className="text-text-primary text-head2-bold"
            >
              {fillName('{name}을 해지하려는 이유를 알려주세요', nameKo)}
            </Text>
            <Text className="text-text-primary text-body2-regular">여러 개 고를 수 있어요</Text>
          </View>
          {/* 설계서: 선택지 영역은 최대 높이(360)를 넘기지 않음 */}
          <ScrollView
            ref={scrollRef}
            className="max-h-[360px] shrink"
            contentContainerClassName="gap-stack-md"
            keyboardShouldPersistTaps="handled"
            onLayout={() => customOn && scrollRef.current?.scrollToEnd()}
          >
            {[...reasons, '직접 입력'].map((reason) => {
              const isCustom = reason === '직접 입력';
              return (
                <OptionCard
                  key={reason}
                  title={reason}
                  showAsset={false}
                  multiple
                  selected={isCustom ? customOn : picked.includes(reason)}
                  onSelect={() => (isCustom ? setCustomOn((on) => !on) : toggle(reason))}
                />
              );
            })}
            {customOn && (
              <TextArea
                value={custom}
                onChangeText={setCustom}
                maxLength={CUSTOM_MAX}
                placeholder="해지하려는 이유를 적어 주세요"
                accessibilityLabel="해지 이유 직접 입력"
                autoFocus
                // 키보드 '완료'로 내림, 입력 내용은 유지
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
              />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View className="pb-safe px-screen-x">
        <Cta label="해지 방법 보기" disabled={!canSubmit} onPress={goGuide} className="mb-[14px]" />
      </View>
    </View>
  );
};
