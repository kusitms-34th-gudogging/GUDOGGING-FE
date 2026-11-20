import { router } from 'expo-router';
import { useState, useSyncExternalStore } from 'react';
import { Image, View } from 'react-native';

import { PlusIcon } from '@/assets/icons';
import { StepRing } from '@/components/checkup/StepRing';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { Cta } from '@/components/common/Cta';
import { OptionCard } from '@/components/common/OptionCard';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { TextArea } from '@/components/common/TextArea';
import { TopBar } from '@/components/common/TopBar';
import {
  type CheckupQuestion,
  type CheckupSubscription,
  toCheckupCategory,
} from '@/constants/checkup';
import { getCheckupScores, useCheckupDraft } from '@/hooks/useCheckupDraft';
import { useCheckupForm } from '@/hooks/useCheckups';
import { useSubmitCheckup } from '@/hooks/useSubmitCheckup';
import { formatWon } from '@/utils/formatPayment';
import { fillName } from '@/utils/josa';

// 점수 문항 1~3, 마지막 4/4는 메모(K-70)
const QUESTION_COUNT = 3;
const MEMO_STEP = QUESTION_COUNT;
const MEMO_MAX = 100;

interface CheckupScreenProps {
  // 구독 id
  id: string;
  // 홈에서 들어오면 저장된 답과 상관없이 1/4부터 (화면설계서 HOM-001)
  restart?: boolean;
}

// 점검 문항 조회(구독 이름·금액·다음 결제일)와 임시 저장 복원이 끝난 뒤에 시작 문항을 정함
export const CheckupScreen = ({ id, restart }: CheckupScreenProps) => {
  const { data, isError, refetch } = useCheckupForm(id);
  // useSyncExternalStore는 구독 직후 값을 다시 읽어서, 렌더~구독 사이에 복원이 끝나도 놓치지 않음
  const { onFinishHydration, hasHydrated } = useCheckupDraft.persist;
  const hydrated = useSyncExternalStore(onFinishHydration, hasHydrated);
  if (!data) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={isError} onRetry={refetch} />
      </View>
    );
  }
  return hydrated ? <CheckupQuestions {...data} restart={restart} /> : null;
};

interface CheckupQuestionsProps {
  subscription: CheckupSubscription;
  // 서버가 카테고리에 맞춰 준 문항 3개와 메모 예시
  questions: CheckupQuestion[];
  memo: { placeholder: string; chips: string[] };
  restart?: boolean;
}

// K-11~K-66: 카테고리마다 문항·선택지·에셋만 다르고 레이아웃은 같음
const CheckupQuestions = ({
  subscription,
  questions,
  memo: memoConfig,
  restart,
}: CheckupQuestionsProps) => {
  const { id, name, amount, nextDate } = subscription;
  const category = toCheckupCategory(subscription.category);
  // 같은 결제 주기 안에서만 이어 하기. 주기가 바뀌면 1/4부터
  const cycle = nextDate.toISOString();
  const setScore = useCheckupDraft((s) => s.setScore);
  const clearDraft = useCheckupDraft((s) => s.clear);
  const submit = useSubmitCheckup(id);
  // 임시 저장된 다음 문항부터 (3문항 다 답했으면 4/4 메모)
  const [step, setStep] = useState(() => (restart ? 0 : getCheckupScores(id, cycle).length));
  const [selected, setSelected] = useState(() => getCheckupScores(id, cycle).at(step));
  // 이전으로 3/4에 갔다 와도 유지. 앱 종료 시엔 임시 저장 안 함 (설계서: 답한 문항까지만)
  const [memo, setMemo] = useState('');

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
  // 제출하면 임시 저장을 지우고, 뒤로 가기로 메모에 돌아오지 않게 replace
  // shortcut: 제출 실패 안내는 디자인에 없어 화면에 그대로 남음, 디자인 나오면 안내 추가
  const finish = (memo: string) =>
    submit.mutate(
      { scores: getCheckupScores(id, cycle), memo },
      {
        onSuccess: ({ checkupId }) => {
          clearDraft(id);
          router.replace(`/checkup/${id}/result?checkupId=${checkupId}`);
        },
      },
    );

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
        onTextActionPress={() => !submit.isPending && finish('')}
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
              {fillName(question.title, name)}
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
                  testID={`checkup-option-${i}`}
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
            testID="checkup-next"
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
              <Button
                testID="checkup-finish"
                label="결과 보기"
                disabled={submit.isPending}
                onPress={() => finish(memo.trim())}
                className="flex-1"
              />
            ) : (
              <Button
                testID="checkup-next"
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
