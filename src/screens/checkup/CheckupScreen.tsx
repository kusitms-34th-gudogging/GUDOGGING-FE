import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { StepRing } from '@/components/checkup/StepRing';
import { Button } from '@/components/common/Button';
import { Cta } from '@/components/common/Cta';
import { OptionCard } from '@/components/common/OptionCard';
import { TopBar } from '@/components/common/TopBar';
import {
  CHECKUP_CATEGORIES,
  type CheckupSubscription,
  toCheckupCategory,
} from '@/constants/checkup';
import { getCheckupScores, useCheckupDraft } from '@/hooks/useCheckupDraft';
import { formatWon } from '@/utils/formatPayment';
import { fillName } from '@/utils/josa';

// 문항 1~3 (4/4 메모 K-70은 별도 화면)
const QUESTION_COUNT = 3;

interface CheckupScreenProps {
  subscription: CheckupSubscription;
}

// 임시 저장을 다 읽은 뒤에 시작 문항을 정함
export const CheckupScreen = ({ subscription }: CheckupScreenProps) => {
  const [hydrated, setHydrated] = useState(useCheckupDraft.persist.hasHydrated);
  useEffect(() => useCheckupDraft.persist.onFinishHydration(() => setHydrated(true)), []);
  return hydrated ? <CheckupQuestions subscription={subscription} /> : null;
};

// K-11~K-66: 카테고리마다 문항·선택지·에셋만 다르고 레이아웃은 같음
const CheckupQuestions = ({ subscription }: CheckupScreenProps) => {
  const { id, name, nameKo = name, amount, nextDate } = subscription;
  const category = toCheckupCategory(subscription.category);
  // 같은 결제 주기 안에서만 이어 하기. 주기가 바뀌면 1/4부터
  const cycle = nextDate.toISOString();
  const setScore = useCheckupDraft((s) => s.setScore);
  // 임시 저장된 다음 문항부터 (3문항 다 답했으면 마지막 문항)
  const [step, setStep] = useState(() =>
    Math.min(getCheckupScores(id, cycle).length, QUESTION_COUNT - 1),
  );
  const [selected, setSelected] = useState(() => getCheckupScores(id, cycle).at(step));

  const question = CHECKUP_CATEGORIES[category].questions[step];
  // Figma 문구 그대로: '다음 결제 11월 17일- 13,500원', '월 구독료 7,890원'
  const hint = question.hint
    .replace(
      '{next}',
      `${nextDate.getMonth() + 1}월 ${nextDate.getDate()}일 · ${formatWon(amount)}`,
    )
    .replace('{amount}', formatWon(amount))
    .replace('{year}', formatWon(amount * 12));

  const goTo = (next: number) => {
    setStep(next);
    // 이전으로 가면 기존 선택 유지
    setSelected(getCheckupScores(id, cycle).at(next));
  };

  const onNext = () => {
    if (selected === undefined) return;
    setScore(id, cycle, step, selected);
    // ponytail: 3/4 다음은 4/4 메모(K-70) 화면이 생기면 거기로 이동
    if (step < QUESTION_COUNT - 1) goTo(step + 1);
  };

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      {/* 뒤로 가기는 팝업 없이 점검 진입 전 화면으로. 답한 문항은 임시 저장돼 있음 */}
      <TopBar
        variant="detail"
        title="구독 점검"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-stack-lg px-screen-x pt-stack-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-inline-md">
            <Image
              source={require('@/assets/images/logo_placeholder.png')}
              className="size-logo-card rounded-full"
            />
            <Text className="text-text-primary text-body2-semibold">{name}</Text>
          </View>
          {/* Figma: 시각 보정으로 2px 안쪽 */}
          <View className="mr-s2">
            <StepRing category={category} step={step + 1} />
          </View>
        </View>
        <View className="gap-inset-lg">
          <View className="max-w-[308px] gap-[6px]">
            <Text
              accessibilityRole="header"
              lineBreakStrategyIOS="hangul-word"
              className="text-text-primary text-head2-bold"
            >
              {fillName(question.title, nameKo)}
            </Text>
            <Text className="text-text-primary text-body2-regular">{hint}</Text>
          </View>
          {/* 점수(1~5)는 노출하지 않고 1점(부정)부터 위에 */}
          <View accessibilityRole="radiogroup" className="gap-stack-md">
            {question.options.map((label, i) => (
              <OptionCard
                key={label}
                title={label}
                showAsset={false}
                selected={selected === i + 1}
                onSelect={() => setSelected(i + 1)}
              />
            ))}
          </View>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        {step === 0 ? (
          <Cta
            label="다음"
            disabled={selected === undefined}
            onPress={onNext}
            className="mb-[14px]"
          />
        ) : (
          <View className="mb-[14px] flex-row gap-inline-sm">
            <Button
              variant="tonal"
              label="이전"
              onPress={() => goTo(step - 1)}
              className="flex-1"
            />
            <Button
              label="다음"
              disabled={selected === undefined}
              onPress={onNext}
              className="flex-1"
            />
          </View>
        )}
      </View>
    </View>
  );
};
