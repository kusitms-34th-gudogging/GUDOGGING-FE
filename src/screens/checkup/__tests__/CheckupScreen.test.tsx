import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { CheckupSubscription } from '@/constants/checkup';
import { useCheckupDraft } from '@/hooks/useCheckupDraft';
import { CheckupScreen } from '@/screens/checkup/CheckupScreen';

const NETFLIX: CheckupSubscription = {
  id: 'netflix',
  name: 'Netflix',
  nameKo: '넷플릭스',
  category: '영상·OTT',
  amount: 13500,
  nextDate: new Date(2026, 10, 17),
};
const NEXT = { name: '다음' };

const renderCheckup = async (subscription = NETFLIX) => {
  await renderRouter(
    {
      checkup: () => <CheckupScreen subscription={subscription} />,
      'checkup/[id]/result': () => null,
    },
    {
      initialUrl: '/checkup',
    },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  useCheckupDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => jest.useRealTimers());

describe('CheckupScreen', () => {
  it('선택 전엔 다음이 비활성, 선택하면 다음 문항으로 넘어간다', async () => {
    const user = await renderCheckup();
    expect(
      screen.getByText('최근 한 달 동안 넷플릭스를 얼마나 자주 이용했나요?'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', NEXT)).toBeDisabled();

    await user.press(screen.getByRole('radio', { name: '3~5편' }));
    await user.press(screen.getByRole('button', NEXT));

    expect(screen.getByText('넷플릭스에서 본 콘텐츠, 구독료만큼 가치 있었나요?')).toBeOnTheScreen();
    expect(screen.getByText('월 13,500원 · 1년이면 162,000원')).toBeOnTheScreen();
  });

  it('이전으로 돌아가면 기존 선택이 유지된다', async () => {
    const user = await renderCheckup();
    await user.press(screen.getByRole('radio', { name: '3~5편' }));
    await user.press(screen.getByRole('button', NEXT));
    await user.press(screen.getByRole('button', { name: '이전' }));

    expect(screen.getByRole('radio', { name: '3~5편' })).toBeSelected();
    expect(screen.getByRole('button', NEXT)).toBeEnabled();
  });

  it('카테고리 미지정 구독은 기타 문항을 쓰고, 보조 문구에 구독료·결제일을 넣는다', async () => {
    const icloud = { id: 'icloud', name: 'iCloud+', amount: 1100, nextDate: new Date(2026, 10, 2) };
    const user = await renderCheckup(icloud);
    expect(
      screen.getByText('하루에 여러 번 써도 1일로 세어 주세요. 자동으로 쓴 날도 포함해요'),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: '한 달에 1~3일' }));
    await user.press(screen.getByRole('button', NEXT));
    expect(screen.getByText('iCloud+, 구독료만큼 가치 있었나요?')).toBeOnTheScreen();
    expect(screen.getByText('월 1,100원 · 1년이면 13,200원')).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: '보통이에요' }));
    await user.press(screen.getByRole('button', NEXT));
    expect(screen.getByText('다음 결제 11월 2일 · 1,100원')).toBeOnTheScreen();
  });

  it('같은 결제 주기에 다시 들어오면 답한 다음 문항부터 이어 한다', async () => {
    useCheckupDraft.getState().setScore('netflix', NETFLIX.nextDate.toISOString(), 0, 2);
    await renderCheckup();
    expect(screen.getByText('넷플릭스에서 본 콘텐츠, 구독료만큼 가치 있었나요?')).toBeOnTheScreen();
  });

  it('홈에서 들어오면(restart) 저장된 답이 있어도 1/4부터 시작한다', async () => {
    [3, 4, 2].forEach((score, step) =>
      useCheckupDraft.getState().setScore('netflix', NETFLIX.nextDate.toISOString(), step, score),
    );
    await renderRouter(
      { checkup: () => <CheckupScreen subscription={NETFLIX} restart /> },
      { initialUrl: '/checkup' },
    );

    expect(screen.queryByText('넷플릭스에 대해\n남기고 싶은 말이 있나요?')).not.toBeOnTheScreen();
    expect(
      screen.getByText('최근 한 달 동안 넷플릭스를 얼마나 자주 이용했나요?'),
    ).toBeOnTheScreen();
  });

  it('3문항을 다 답했으면 4/4 메모부터, 칩은 입력란에 이어 붙고 건너뛰기가 보인다', async () => {
    [3, 4, 2].forEach((score, step) =>
      useCheckupDraft.getState().setScore('netflix', NETFLIX.nextDate.toISOString(), step, score),
    );
    const user = await renderCheckup();
    expect(screen.getByText('넷플릭스에 대해\n남기고 싶은 말이 있나요?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '건너뛰기' })).toBeOnTheScreen();

    const memo = screen.getByLabelText('메모');
    await user.press(screen.getByRole('button', { name: '이번 달은 바빴어요' }));
    expect(memo).toHaveDisplayValue('이번 달은 바빴어요');

    await user.type(memo, ' 다음 달은 ');
    await user.press(screen.getByRole('button', { name: '비싸지면 해지할래요' }));
    expect(memo).toHaveDisplayValue('이번 달은 바빴어요 다음 달은 비싸지면 해지할래요');
  });

  it('칩을 붙여 100자를 넘으면 100자에서 자른다', async () => {
    [3, 4, 2].forEach((score, step) =>
      useCheckupDraft.getState().setScore('netflix', NETFLIX.nextDate.toISOString(), step, score),
    );
    const user = await renderCheckup();
    const memo = screen.getByLabelText('메모');
    fireEvent.changeText(memo, '가'.repeat(95));
    await user.press(screen.getByRole('button', { name: '이번 달은 바빴어요' }));
    expect(memo).toHaveDisplayValue(`${'가'.repeat(95)} 이번 달`);
  });

  it('메모에서 이전으로 3/4에 갔다 오면 메모가 유지된다', async () => {
    [3, 4, 2].forEach((score, step) =>
      useCheckupDraft.getState().setScore('netflix', NETFLIX.nextDate.toISOString(), step, score),
    );
    const user = await renderCheckup();
    await user.press(screen.getByRole('button', { name: '이번 달은 바빴어요' }));
    await user.press(screen.getByRole('button', { name: '이전' }));
    expect(screen.queryByRole('button', { name: '건너뛰기' })).toBeNull();
    expect(screen.getByRole('radio', { name: '거의 안 쓸 것 같아요' })).toBeSelected();

    await user.press(screen.getByRole('button', NEXT));
    expect(screen.getByLabelText('메모')).toHaveDisplayValue('이번 달은 바빴어요');
  });

  it('이전으로 두 번 갔다가 다음으로 돌아와도 3/4 선택이 유지된다', async () => {
    [3, 4, 2].forEach((score, step) =>
      useCheckupDraft.getState().setScore('netflix', NETFLIX.nextDate.toISOString(), step, score),
    );
    const user = await renderCheckup();
    await user.press(screen.getByRole('button', { name: '이전' }));
    await user.press(screen.getByRole('button', { name: '이전' }));
    await user.press(screen.getByRole('button', NEXT));

    expect(screen.getByRole('radio', { name: '거의 안 쓸 것 같아요' })).toBeSelected();
    expect(screen.getByRole('button', NEXT)).toBeEnabled();
  });

  it.each(['결과 보기', '건너뛰기'])('메모에서 %s를 누르면 점검 결과로 이동한다', async (name) => {
    [3, 4, 2].forEach((score, step) =>
      useCheckupDraft.getState().setScore('netflix', NETFLIX.nextDate.toISOString(), step, score),
    );
    const user = await renderCheckup();
    await user.press(screen.getByRole('button', { name }));
    expect(screen).toHavePathname('/checkup/netflix/result');
  });

  it('결제 주기가 바뀌었으면 1/4부터 다시 시작한다', async () => {
    useCheckupDraft.getState().setScore('netflix', new Date(2026, 9, 17).toISOString(), 0, 2);
    await renderCheckup();
    expect(
      screen.getByText('최근 한 달 동안 넷플릭스를 얼마나 자주 이용했나요?'),
    ).toBeOnTheScreen();
  });
});
