import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { apiError, createQueryWrapper, mockApi, TEST_FOUND, TEST_SERVICES } from '@/lib/testing';
import { RegisterFoundScreen } from '@/screens/register/RegisterFoundScreen';

const CTA = { name: '선택한 구독 등록하기' };

const renderFound = async () => {
  await renderRouter(
    {
      'register/found': () => <RegisterFoundScreen />,
      'register/done': () => null,
    },
    { initialUrl: '/register/found', wrapper: createQueryWrapper() },
  );
  // 구독 추가하기로 고른 서비스 이름은 서비스 목록 응답에서
  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
  mockApi({
    'GET /api/v1/services': { services: TEST_SERVICES },
    'POST /api/v1/subscriptions': { createdCount: 1 },
  });
  // 분석 결과를 받은 상태 (setFound가 전부 체크하므로 각 테스트가 체크를 다시 정함)
  useRegisterDraft.getState().setFound('SCREENSHOT', TEST_FOUND);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('RegisterFoundScreen', () => {
  // 샘플: ChatGPT Plus는 금액을 못 읽어 확인 필요, YouTube Premium은 바로 등록 가능
  it('등록 가능에서 체크한 구독이 없으면 등록할 수 없다', async () => {
    useRegisterDraft.getState().setFoundChecked(['found-youtube']);
    const user = await renderFound();

    await user.press(screen.getByRole('checkbox', { name: 'YouTube Premium' }));

    expect(screen.getByRole('button', CTA)).toBeDisabled();
  });

  it('확인 필요 항목은 체크할 수 없고, 미리 체크돼 있어도 등록에서 빠진다', async () => {
    useRegisterDraft.getState().setFoundChecked(['found-chatgpt', 'found-youtube']);
    const user = await renderFound();

    expect(screen.queryByRole('checkbox', { name: 'ChatGPT Plus' })).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', CTA));

    expect(screen).toHaveSearchParams({ ids: 'found-youtube' });
  });

  it('수정 화면에서 결제 정보를 저장한 항목은 확인 필요여도 등록할 수 있다', async () => {
    useRegisterDraft.getState().setFoundChecked(['found-chatgpt']);
    useRegisterDraft.getState().setPayment('found-chatgpt', {
      category: '생산성·AI',
      amount: 29000,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    });
    await renderFound();

    expect(screen.getByRole('button', CTA)).toBeEnabled();
  });

  it('등록하면 체크한 항목만 완료 화면으로 넘긴다', async () => {
    useRegisterDraft.getState().setFoundChecked(['found-youtube']);
    const user = await renderFound();

    await user.press(screen.getByRole('button', CTA));

    expect(screen).toHavePathname('/register/done');
    expect(screen).toHaveSearchParams({ ids: 'found-youtube' });
    // 완료 화면은 저장소의 결제 정보로 금액·요약을 그림
    expect(useRegisterDraft.getState().payments['found-youtube']).toMatchObject({
      amount: 17000,
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    });
  });

  it('구독 추가하기로 추가한 구독도 목록에 보이고 함께 등록한다', async () => {
    useRegisterDraft.getState().setSelectedIds(['spotify']);
    useRegisterDraft.getState().setPayment('spotify', {
      category: '음악',
      amount: 10900,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 20),
      paidAt: 'appstore',
    });
    useRegisterDraft.getState().setFoundChecked(['found-youtube', 'spotify']);
    const user = await renderFound();
    await screen.findByText('Spotify');

    await user.press(screen.getByRole('button', CTA));

    expect(screen).toHaveSearchParams({ ids: 'found-youtube,spotify' });
  });

  it('불러온 구독의 이름을 바꾸면 같은 서비스를 구독 추가하기로 따로 추가할 수 있다', async () => {
    // 분석이 Netflix로 알아본 항목을 수정 화면에서 다른 이름으로 바꿈
    useRegisterDraft.getState().setPayment('found-netflix', {
      name: '넷플 가족',
      category: '영상·OTT',
      amount: 13500,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 20),
      paidAt: 'web',
    });
    useRegisterDraft.getState().setSelectedIds(['netflix']);
    useRegisterDraft.getState().setFoundChecked([]);
    await renderFound();

    expect(screen.getByText('넷플 가족')).toBeOnTheScreen();
    expect(await screen.findByText('Netflix')).toBeOnTheScreen();
  });

  it('체크한 구독을 분석 출처와 함께 일괄 등록한다. 이름을 바꾼 불러온 구독은 사전 등록 서비스로 보내지 않는다', async () => {
    useRegisterDraft.getState().setFound('GMAIL', TEST_FOUND);
    // 분석이 Netflix로 알아본 항목을 수정 화면에서 다른 이름으로 바꿔 저장
    useRegisterDraft.getState().setPayment('found-netflix', {
      name: '넷플 가족',
      category: '영상·OTT',
      amount: 13500,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 20),
      paidAt: 'web',
    });
    useRegisterDraft.getState().setFoundChecked(['found-youtube', 'found-netflix']);
    const user = await renderFound();

    await user.press(screen.getByRole('button', CTA));

    await waitFor(() => expect(screen).toHavePathname('/register/done'));
    const post = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'POST');
    const body = JSON.parse(String(post?.[1]?.body));
    expect(body.source).toBe('GMAIL');
    const sent = body.subscriptions.map((s: { serviceId: string | null; serviceName: string }) => [
      s.serviceId,
      s.serviceName,
    ]);
    expect(sent).toHaveLength(2);
    expect(sent).toEqual(
      expect.arrayContaining([
        [null, '넷플 가족'],
        ['youtube', 'YouTube Premium'],
      ]),
    );
  });

  it('등록에 실패하면 불러온 구독 확인에 남는다', async () => {
    mockApi({
      'GET /api/v1/services': { services: TEST_SERVICES },
      'POST /api/v1/subscriptions': apiError(409),
    });
    useRegisterDraft.getState().setFoundChecked(['found-youtube']);
    const user = await renderFound();

    await user.press(screen.getByRole('button', CTA));

    await waitFor(() => expect(screen.getByRole('button', CTA)).toBeEnabled());
    expect(screen).toHavePathname('/register/found');
  });
});
