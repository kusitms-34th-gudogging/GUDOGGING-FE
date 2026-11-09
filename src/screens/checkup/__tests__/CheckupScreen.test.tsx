import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
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
    { checkup: () => <CheckupScreen subscription={subscription} /> },
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

  it('결제 주기가 바뀌었으면 1/4부터 다시 시작한다', async () => {
    useCheckupDraft.getState().setScore('netflix', new Date(2026, 9, 17).toISOString(), 0, 2);
    await renderCheckup();
    expect(
      screen.getByText('최근 한 달 동안 넷플릭스를 얼마나 자주 이용했나요?'),
    ).toBeOnTheScreen();
  });
});
