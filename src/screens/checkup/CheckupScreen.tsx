import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { PlusIcon } from '@/assets/icons';
import { StepRing } from '@/components/checkup/StepRing';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { Cta } from '@/components/common/Cta';
import { OptionCard } from '@/components/common/OptionCard';
import { TextArea } from '@/components/common/TextArea';
import { TopBar } from '@/components/common/TopBar';
import {
  CHECKUP_CATEGORIES,
  type CheckupSubscription,
  toCheckupCategory,
} from '@/constants/checkup';
import { getCheckupScores, useCheckupDraft } from '@/hooks/useCheckupDraft';
import { formatWon } from '@/utils/formatPayment';
import { fillName } from '@/utils/josa';

// 점수 문항 1~3, 마지막 4/4는 메모(K-70)
const QUESTION_COUNT = 3;
const MEMO_STEP = QUESTION_COUNT;
const MEMO_MAX = 100;

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
  // 임시 저장된 다음 문항부터 (3문항 다 답했으면 4/4 메모)
  const [step, setStep] = useState(() => getCheckupScores(id, cycle).length);
  const [selected, setSelected] = useState(() => getCheckupScores(id, cycle).at(step));
  // 이전으로 3/4에 갔다 와도 유지. 앱 종료 시엔 임시 저장 안 함 (설계서: 답한 문항까지만)
  const [memo, setMemo] = useState('');

  const { questions, memo: memoConfig } = CHECKUP_CATEGORIES[category];
  const isMemo = step === MEMO_STEP;
  const question = isMemo
    ? { title: '{name}에 대해\n남기고 싶은 말이 있나요?', hint: '다음 점검 때 다시 보여드려요' }
    : questions[step];
  // '월 13,500원 · 1년이면 162,000원', '다음 결제 11월 17일 · 13,500원'
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
    goTo(step + 1);
  };

  // 칩 문구를 입력란에 넣음. 이미 쓴 내용이 있으면 뒤에 이어 붙이고 100자에서 자름
  const addChip = (text: string) =>
    setMemo((m) => (m.trim() ? `${m.trimEnd()} ${text}` : text).slice(0, MEMO_MAX));

  // 공백만 입력했으면 빈 메모. 메모는 점수에 반영하지 않음
  // ponytail: 점검 기록 저장 API·결과 화면(K-80)이 생기면 점수 + 메모 저장 후 이동하고 임시 저장 삭제
  const finish = (_memo: string) => {};

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      {/* 뒤로 가기는 팝업 없이 점검 진입 전 화면으로. 답한 문항은 임시 저장돼 있음 */}
      <TopBar
        variant="detail"
        title="구독 점검"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
        // 건너뛰기: 메모 없이 결과로
        showTextAction={isMemo}
        textAction="건너뛰기"
        onTextActionPress={() => finish('')}
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
          {isMemo ? (
            <View className="gap-inset-sm">
              <TextArea
                value={memo}
                onChangeText={setMemo}
                maxLength={MEMO_MAX}
                placeholder={memoConfig.placeholder}
                accessibilityLabel="메모"
              />
              <View className="flex-row flex-wrap gap-x-[10px] gap-y-s8">
                {memoConfig.chips.map((chip) => (
                  <Chip
                    key={chip}
                    label={chip}
                    icon={PlusIcon}
                    selected={false}
                    onSelect={() => addChip(chip)}
                  />
                ))}
              </View>
            </View>
          ) : (
            /* 점수(1~5)는 노출하지 않고 1점(부정)부터 위에 */
            <View accessibilityRole="radiogroup" className="gap-stack-md">
              {questions[step].options.map((label, i) => (
                <OptionCard
                  key={label}
                  title={label}
                  showAsset={false}
                  selected={selected === i + 1}
                  onSelect={() => setSelected(i + 1)}
                />
              ))}
            </View>
          )}
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
            {isMemo ? (
              <Button label="결과 보기" onPress={() => finish(memo.trim())} className="flex-1" />
            ) : (
              <Button
                label="다음"
                disabled={selected === undefined}
                onPress={onNext}
                className="flex-1"
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};
