import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, userEvent } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { getCheckupScores, useCheckupDraft } from '@/hooks/useCheckupDraft';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { CheckupScreen } from '@/screens/checkup/CheckupScreen';

// 점검 문항 조회 응답 (서버가 카테고리에 맞춰 준 문구, 화면설계서 K-11~K-70)
const q = (type: string, label: string, hint: string | null, texts: string[]) => ({
  type,
  label,
  hint,
  // 순서가 섞여 와도 점수 순(1점 부정부터)으로 보여줌
  options: texts.map((text, i) => ({ score: i + 1, text })).reverse(),
});
const value = (label: string) =>
  q('SATISFACTION', label, '월 {amount} · 1년이면 {year}', [
    '많이 아까워요',
    '조금 아까워요',
    '보통이에요',
    '구독료만큼 가치 있어요',
    '구독료보다 더 가치 있어요',
  ]);
const PLAN = q('PLAN', '다음 달에도 {name}을 이용할 계획이 있나요?', '다음 결제 {next}', [
  '안 쓸 거예요',
  '거의 안 쓸 것 같아요',
  '아직 잘 모르겠어요',
  '아마 계속 쓸 것 같아요',
  '꼭 계속 쓸 거예요',
]);
const USAGE = '최근 한 달 동안 {name}을 얼마나 자주 이용했나요?';
const NETFLIX = {
  id: 'netflix',
  serviceName: '넷플릭스',
  category: 'VIDEO_OTT',
  amount: 13500,
  nextBillingDate: '2026-11-17',
  questions: [
    q('USAGE', USAGE, '에피소드, 영화 모두 1편으로 세어 주세요', [
      '안 봤어요',
      '1~2편',
      '3~5편',
      '6~10편',
      '11편 이상',
    ]),
    value('{name}에서 본 콘텐츠, 구독료만큼 가치 있었나요?'),
    PLAN,
  ],
  memoPlaceholder: '예: 시즌 3 공개돼서 이번 달은 유지할래요',
  memoChips: ['보고 싶은 작품이 있어요', '이번 달은 바빴어요', '비싸지면 해지할래요'],
};
// 임시 저장 결제 주기 구분값 (다음 결제일)
const CYCLE = new Date(2026, 10, 17).toISOString();
const NEXT = { name: '다음' };
const answerAll = () =>
  [3, 4, 2].forEach((score, step) =>
    useCheckupDraft.getState().setScore('netflix', CYCLE, step, score),
  );

const postBody = () =>
  jest.mocked(globalThis.fetch).mock.calls.find(([, init]) => init?.method === 'POST')?.[1]?.body;

const renderCheckup = async ({
  subscription = NETFLIX,
  restart = false,
  routes = {},
}: { subscription?: typeof NETFLIX; restart?: boolean; routes?: Record<string, unknown> } = {}) => {
  mockApi({
    [`GET /api/v1/subscriptions/${subscription.id}/checkups/form`]: subscription,
    ...routes,
  });
  await renderRouter(
    {
      checkup: () => <CheckupScreen id={subscription.id} restart={restart} />,
      'checkup/[id]/result': () => null,
    },
    { initialUrl: '/checkup', wrapper: createQueryWrapper() },
  );
  await screen.findByText(subscription.serviceName);
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  useCheckupDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

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

  it('서버가 준 카테고리 문항을 쓰고, 이름 조사·보조 문구의 구독료·결제일을 채운다', async () => {
    const icloud = {
      ...NETFLIX,
      id: 'icloud',
      serviceName: 'iCloud+',
      category: 'ETC',
      amount: 1100,
      nextBillingDate: '2026-11-02',
      questions: [
        q('USAGE', USAGE, '하루에 여러 번 써도 1일로 세어 주세요. 자동으로 쓴 날도 포함해요', [
          '안 썼어요',
          '한 달에 1~3일',
          '주 1~2일',
          '주 3~5일',
          '거의 매일',
        ]),
        value('{name}, 구독료만큼 가치 있었나요?'),
        PLAN,
      ],
    };
    const user = await renderCheckup({ subscription: icloud });
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
    useCheckupDraft.getState().setScore('netflix', CYCLE, 0, 2);
    await renderCheckup();
    expect(screen.getByText('넷플릭스에서 본 콘텐츠, 구독료만큼 가치 있었나요?')).toBeOnTheScreen();
  });

  it('홈에서 들어오면(restart) 저장된 답이 있어도 1/4부터 시작한다', async () => {
    answerAll();
    await renderCheckup({ restart: true });

    expect(screen.queryByText('넷플릭스에 대해\n남기고 싶은 말이 있나요?')).not.toBeOnTheScreen();
    expect(
      screen.getByText('최근 한 달 동안 넷플릭스를 얼마나 자주 이용했나요?'),
    ).toBeOnTheScreen();
  });

  it('3문항을 다 답했으면 4/4 메모부터, 칩은 입력란에 이어 붙고 건너뛰기가 보인다', async () => {
    answerAll();
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
    answerAll();
    const user = await renderCheckup();
    const memo = screen.getByLabelText('메모');
    fireEvent.changeText(memo, '가'.repeat(95));
    await user.press(screen.getByRole('button', { name: '이번 달은 바빴어요' }));
    expect(memo).toHaveDisplayValue(`${'가'.repeat(95)} 이번 달`);
  });

  it('메모에서 이전으로 3/4에 갔다 오면 메모가 유지된다', async () => {
    answerAll();
    const user = await renderCheckup();
    await user.press(screen.getByRole('button', { name: '이번 달은 바빴어요' }));
    await user.press(screen.getByRole('button', { name: '이전' }));
    expect(screen.queryByRole('button', { name: '건너뛰기' })).toBeNull();
    expect(screen.getByRole('radio', { name: '거의 안 쓸 것 같아요' })).toBeSelected();

    await user.press(screen.getByRole('button', NEXT));
    expect(screen.getByLabelText('메모')).toHaveDisplayValue('이번 달은 바빴어요');
  });

  it('이전으로 두 번 갔다가 다음으로 돌아와도 3/4 선택이 유지된다', async () => {
    answerAll();
    const user = await renderCheckup();
    await user.press(screen.getByRole('button', { name: '이전' }));
    await user.press(screen.getByRole('button', { name: '이전' }));
    await user.press(screen.getByRole('button', NEXT));

    expect(screen.getByRole('radio', { name: '거의 안 쓸 것 같아요' })).toBeSelected();
    expect(screen.getByRole('button', NEXT)).toBeEnabled();
  });

  it('결과 보기를 누르면 답과 메모를 제출하고, 임시 저장을 지운 뒤 받은 점검 결과로 간다', async () => {
    answerAll();
    const user = await renderCheckup({
      routes: { 'POST /api/v1/subscriptions/netflix/checkups': { checkupId: 'c1' } },
    });
    await user.press(screen.getByRole('button', { name: '이번 달은 바빴어요' }));
    await user.press(screen.getByRole('button', { name: '결과 보기' }));

    await waitFor(() => expect(screen).toHavePathname('/checkup/netflix/result'));
    expect(screen).toHaveSearchParams({ id: 'netflix', checkupId: 'c1' });
    expect(JSON.parse(String(postBody()))).toEqual({
      answers: [
        { type: 'USAGE', score: 3 },
        { type: 'SATISFACTION', score: 4 },
        { type: 'PLAN', score: 2 },
      ],
      memo: '이번 달은 바빴어요',
    });
    expect(getCheckupScores('netflix', CYCLE)).toEqual([]);
  });

  it('건너뛰기는 메모 없이 제출한다', async () => {
    answerAll();
    const user = await renderCheckup({
      routes: { 'POST /api/v1/subscriptions/netflix/checkups': { checkupId: 'c1' } },
    });
    await user.press(screen.getByRole('button', { name: '건너뛰기' }));

    await waitFor(() => expect(screen).toHavePathname('/checkup/netflix/result'));
    expect(JSON.parse(String(postBody()))).not.toHaveProperty('memo');
  });

  it('제출에 실패하면 메모 화면에 남고 임시 저장도 그대로다', async () => {
    answerAll();
    const user = await renderCheckup({
      routes: { 'POST /api/v1/subscriptions/netflix/checkups': apiError(500) },
    });
    await user.press(screen.getByRole('button', { name: '결과 보기' }));

    await waitFor(() => expect(screen.getByRole('button', { name: '결과 보기' })).toBeEnabled());
    expect(screen).toHavePathname('/checkup');
    expect(getCheckupScores('netflix', CYCLE)).toEqual([3, 4, 2]);
  });

  it('불러오지 못하면 다시 시도로 다시 요청한다', async () => {
    mockApi({ 'GET /api/v1/subscriptions/netflix/checkups/form': apiError(500) });
    await renderRouter(
      { checkup: () => <CheckupScreen id="netflix" /> },
      { initialUrl: '/checkup', wrapper: createQueryWrapper() },
    );
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await user.press(await screen.findByRole('button', { name: '다시 시도' }));

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('결제 주기가 바뀌었으면 1/4부터 다시 시작한다', async () => {
    useCheckupDraft.getState().setScore('netflix', new Date(2026, 9, 17).toISOString(), 0, 2);
    await renderCheckup();
    expect(
      screen.getByText('최근 한 달 동안 넷플릭스를 얼마나 자주 이용했나요?'),
    ).toBeOnTheScreen();
  });
});
