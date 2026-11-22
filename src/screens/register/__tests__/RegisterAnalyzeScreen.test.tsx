import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import { router, Stack } from 'expo-router';
import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { RegisterAnalyzeScreen } from '@/screens/register/RegisterAnalyzeScreen';

// 애니메이션은 네이티브 렌더링이라 그리지 않음
jest.mock('lottie-react-native', () => () => null);
// 파일은 네이티브 모듈이라 어떤 uri로 만들었는지만 봄
jest.mock('expo-file-system', () => ({ File: jest.fn() }));

const SCREENSHOT = 'POST /api/v1/subscriptions/screenshots/analyses';
const candidate = (over: object = {}) => ({
  serviceId: 'youtube',
  serviceName: 'YouTube Premium',
  logoUrl: null,
  category: 'VIDEO_OTT',
  amount: 14900,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  nextBillingDate: '2026-11-18',
  paymentMethod: 'APP_STORE',
  needsReview: false,
  reviewFields: [],
  ...over,
});

const renderAnalyze = async (source: 'screenshot' | 'gmail' = 'screenshot') => {
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/screenshot': () => null,
      'register/gmail': () => null,
      'register/images': () => null,
      'register/analyze': () => (
        <RegisterAnalyzeScreen source={source} images={['file:///a.png', 'file:///b.jpg']} />
      ),
      'register/failed': () => null,
      'register/found': () => null,
    },
    {
      initialUrl: source === 'gmail' ? '/register/gmail' : '/register/screenshot',
      wrapper: createQueryWrapper(),
    },
  );
  if (source === 'screenshot') await act(() => router.push('/register/images'));
  await act(() => router.push('/register/analyze'));
};
const calls = () => jest.mocked(globalThis.fetch).mock.calls;

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('스크린샷을 올려 분석하고, 결과를 저장해 불러온 구독 확인으로 간다', async () => {
  mockApi({
    [SCREENSHOT]: {
      candidates: [
        candidate({ logoUrl: 'https://cdn.gudogging.com/logos/youtube.png' }),
        candidate({
          serviceId: 'chatgpt',
          serviceName: 'ChatGPT Plus',
          category: 'PRODUCTIVITY_AI',
          amount: null,
          needsReview: true,
          reviewFields: ['AMOUNT'],
        }),
      ],
    },
  });
  await renderAnalyze();

  // 응답이 와도 최소 1.5초는 분석 중 화면
  await act(() => jest.advanceTimersByTime(1000));
  expect(screen).toHavePathname('/register/analyze');
  await act(() => jest.advanceTimersByTime(500));
  await waitFor(() => expect(screen).toHavePathname('/register/found'));

  const body = calls()[0][1]?.body as FormData;
  expect(body).toBeInstanceOf(FormData);
  expect(body.getAll('images')).toHaveLength(2);
  // expo/fetch(SDK 58 전역 fetch)가 읽을 수 있게 고른 이미지마다 expo-file-system File로 붙임
  expect(jest.mocked(File).mock.calls).toEqual([['file:///a.png'], ['file:///b.jpg']]);
  const { found, foundSource, foundChecked } = useRegisterDraft.getState();
  expect(foundSource).toBe('SCREENSHOT');
  expect(found).toEqual([
    {
      id: 'found-0',
      serviceId: 'youtube',
      name: 'YouTube Premium',
      logoUrl: 'https://cdn.gudogging.com/logos/youtube.png',
      payment: {
        category: '영상·OTT',
        amount: 14900,
        cycle: 1,
        unit: '개월',
        nextDate: new Date(2026, 10, 18),
        paidAt: 'appstore',
      },
      needsReview: false,
      reviewFields: [],
    },
    // 읽지 못한 값은 비워 두고, 확인할 필드는 수정 화면(A-15)으로 넘김
    {
      id: 'found-1',
      serviceId: 'chatgpt',
      name: 'ChatGPT Plus',
      payment: expect.objectContaining({ amount: undefined }),
      needsReview: true,
      reviewFields: ['AMOUNT'],
    },
  ]);
  // 등록 가능 항목은 처음부터 전부 체크 (기획 답변)
  expect(foundChecked).toEqual(['found-0', 'found-1']);
});

it.each([
  ['찾은 구독이 없으면', { candidates: [] }],
  ['분석에 실패하면', apiError(400)],
])(
  '%s 실패 화면으로 가고, 그 아래가 안내(A-06)라 스와이프로 돌아가도 A-06이다',
  async (_, response) => {
    mockApi({ [SCREENSHOT]: response });
    await renderAnalyze();

    await act(() => jest.advanceTimersByTime(1500));
    await waitFor(() => expect(screen).toHavePathname('/register/failed'));
    expect(useRegisterDraft.getState().found).toEqual([]);

    // 스와이프 뒤로가기 = 스택에서 한 칸 뒤로
    await act(() => router.back());
    expect(screen).toHavePathname('/register/screenshot');
  },
);

it('Gmail은 연동한 뒤 결제 메일을 분석하고, 출처를 Gmail로 저장한다', async () => {
  mockApi({
    'POST /api/v1/gmail/connection': { status: 'CONNECTED', connected: true, email: 'a@gmail.com' },
    'POST /api/v1/gmail/analyses': { candidates: [candidate()] },
  });
  await renderAnalyze('gmail');

  await act(() => jest.advanceTimersByTime(1500));
  await waitFor(() => expect(screen).toHavePathname('/register/found'));

  expect(calls().map(([url]) => new URL(String(url)).pathname)).toEqual([
    '/api/v1/gmail/connection',
    '/api/v1/gmail/analyses',
  ]);
  expect(useRegisterDraft.getState().foundSource).toBe('GMAIL');
});
