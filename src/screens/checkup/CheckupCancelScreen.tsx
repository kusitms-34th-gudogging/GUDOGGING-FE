import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  View,
} from 'react-native';

import { Cta } from '@/components/common/Cta';
import { OptionCard } from '@/components/common/OptionCard';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { TextArea } from '@/components/common/TextArea';
import { TopBar } from '@/components/common/TopBar';
import { CHECKUP_CATEGORIES, toCheckupCategory } from '@/constants/checkup';
import { CANCEL_REASON_CODES, useDecideCheckup } from '@/hooks/useDecideCheckup';
import { useSubscription } from '@/hooks/useSubscriptions';
import { fillName } from '@/utils/josa';

const CUSTOM_MAX = 100;

interface CheckupCancelScreenProps {
  // 구독 id
  id: string;
  // 점검 결과(K-80)에서 왔으면 그 점검. 구독 상세(M-03)에서 바로 왔으면 없음 → 결정 저장 없이 해지 안내로
  checkupId?: string;
}

// K-90 해지 이유 (복수 선택 + 직접 입력)
export const CheckupCancelScreen = ({ id, checkupId }: CheckupCancelScreenProps) => {
  const { data: subscription, isError, refetch } = useSubscription(id);
  const decide = useDecideCheckup(checkupId ?? '');
  const [picked, setPicked] = useState<string[]>([]);
  const [customOn, setCustomOn] = useState(false);
  const [custom, setCustom] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);

  if (!subscription) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={isError} onRetry={refetch} />
      </View>
    );
  }
  const { name } = subscription;
  const reasons = CHECKUP_CATEGORIES[toCheckupCategory(subscription.category)].cancelReasons;

  const toggle = (reason: string) =>
    setPicked((p) => (p.includes(reason) ? p.filter((r) => r !== reason) : [...p, reason]));
  // 선택지 1개 이상 또는 직접 입력 내용이 있으면 활성화 (공백만은 빈 값)
  const canSubmit = picked.length > 0 || (customOn && custom.trim() !== '');

  const goGuide = () => router.push(`/cancel/${id}`);
  // 해지 결정 저장 후 해지 안내로. 건너뛰기는 이유 없이 저장 (명세: 이유는 선택)
  // 선택지는 해지 이유 코드 순서와 같음 (잘 안 씀 · 구독료 부담 · 부족한 점 · 옮김 · 목적 달성)
  // shortcut: 저장 실패 안내는 디자인에 없어 화면에 남음, 디자인 나오면 안내 추가
  const submit = (withReasons: boolean) => {
    if (!checkupId) return goGuide();
    const text = customOn ? custom.trim() : '';
    decide.mutate(
      {
        decision: 'CANCEL',
        cancelReasons: withReasons
          ? picked.map((r) => CANCEL_REASON_CODES[reasons.indexOf(r)])
          : [],
        ...(withReasons && text && { cancelReasonText: text }),
      },
      { onSuccess: goGuide },
    );
  };

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
        onTextActionPress={() => !decide.isPending && submit(false)}
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
              {fillName('{name}을 해지하려는 이유를 알려주세요', name)}
            </Text>
            <Text className="text-text-primary text-body2-regular">여러 개 고를 수 있어요</Text>
          </View>
          {/* 설계서: 선택지 영역은 최대 높이(360)를 넘기지 않음 */}
          <ScrollView
            bounces={false}
            ref={scrollRef}
            className="max-h-[360px] shrink"
            contentContainerClassName="gap-stack-md"
            keyboardShouldPersistTaps="handled"
            onLayout={() => customOn && scrollRef.current?.scrollToEnd()}
          >
            {[...reasons, '직접 입력'].map((reason, i) => {
              const isCustom = reason === '직접 입력';
              return (
                <OptionCard
                  key={reason}
                  testID={`cancel-reason-${i}`}
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
        <Cta
          testID="cancel-reason-submit"
          label="해지 방법 보기"
          disabled={!canSubmit || decide.isPending}
          onPress={() => submit(true)}
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
