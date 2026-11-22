import { userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Pressable } from 'react-native';

import TabsLayout from '@/app/(tabs)/_layout';
import { Text } from '@/components/common/Text';
import { useCreateSubscriptions } from '@/hooks/useCreateSubscriptions';
import { createQueryWrapper, mockApi, TEST_SERVICES } from '@/lib/testing';
import { RegisterDoneScreen } from '@/screens/register/RegisterDoneScreen';

jest.mock('lottie-react-native', () => () => null);

beforeEach(() => {
  jest.useFakeTimers();
  mockApi({ 'GET /api/v1/services': { services: TEST_SERVICES } });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// 탭(홈·구독 관리) 위에 등록 완료(A-05)를 띄움
const renderDoneFrom = async (tab: '/' | '/manage') => {
  const rendered = await renderRouter(
    {
      '(tabs)/_layout': TabsLayout,
      '(tabs)/index': () => null,
      '(tabs)/calendar': () => null,
      '(tabs)/manage': () => null,
      '(tabs)/mypage': () => null,
      'register/_layout': () => <Stack />,
      'register/done': () => <RegisterDoneScreen />,
    },
    { initialUrl: tab, wrapper: createQueryWrapper() },
  );
  await act(() => router.push('/register/done'));
  return { user: userEvent.setup({ advanceTimers: jest.advanceTimersByTime }), rendered: rendered };
};

it.each([
  ['구독 관리', '/manage', '/manage'],
  ['홈', '/', '/'],
] as const)('%s에서 들어왔으면 확인을 누르면 %s로 돌아간다', async (_, from, to) => {
  const { user, rendered } = await renderDoneFrom(from);

  await user.press(screen.getByRole('button', { name: '확인' }));

  expect(screen).toHavePathname(to);
  // 등록 화면을 스택에 남기지 않고 닫음
  expect(JSON.stringify(rendered.getRouterState())).not.toContain('"name":"register"');
});

it('구독 관리에서 들어왔으면 뒤로 가기도 구독 관리로 돌아간다', async () => {
  const { user } = await renderDoneFrom('/manage');

  await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

  expect(screen).toHavePathname('/manage');
});

// A-04의 등록 버튼 대신 등록 요청만 보내고 완료 화면으로
const Register = () => {
  const create = useCreateSubscriptions();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        create.mutate(
          {
            source: 'MANUAL',
            subscriptions: [
              {
                serviceId: 'netflix',
                name: 'Netflix',
                payment: {
                  category: '영상·OTT',
                  amount: 13500,
                  cycle: 1,
                  unit: '개월',
                  nextDate: new Date(2026, 11, 1),
                  paidAt: 'web',
                },
              },
            ],
          },
          { onSuccess: () => router.push('/register/done') },
        )
      }
    >
      <Text>등록하기</Text>
    </Pressable>
  );
};

it('등록 응답에 담긴, 서버가 저장한 구독으로 목록을 그린다', async () => {
  mockApi({
    'POST /api/v1/subscriptions': {
      createdCount: 1,
      // 요청과 다른 값이 와도 응답을 따름
      subscriptions: [
        {
          subscriptionId: 's1',
          serviceName: '넷플릭스 프리미엄',
          logoUrl: null,
          amount: 29000,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-11-12',
          paymentMethod: 'WEB_DIRECT',
        },
      ],
    },
  });
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/index': Register,
      'register/done': () => <RegisterDoneScreen />,
    },
    { initialUrl: '/register', wrapper: createQueryWrapper() },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '등록하기' }));

  expect(await screen.findByText('넷플릭스 프리미엄')).toBeOnTheScreen();
  expect(screen.getByText('11월 12일 결제 · 매월 · 웹·직접 결제')).toBeOnTheScreen();
  expect(screen.getByText('29,000원')).toBeOnTheScreen();
  expect(screen.queryByText('Netflix')).not.toBeOnTheScreen();
});
