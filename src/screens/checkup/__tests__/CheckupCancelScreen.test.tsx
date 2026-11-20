import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { createQueryWrapper, mockApi } from '@/lib/testing';
import { CheckupCancelScreen } from '@/screens/checkup/CheckupCancelScreen';

const detail = (over: object = {}) => ({
  subscriptionId: 'netflix',
  status: 'ACTIVE',
  serviceName: '넷플릭스',
  category: 'VIDEO_OTT',
  amount: 13500,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  nextBillingDate: '2026-11-17',
  startedAt: '2026-01-17',
  paymentMethod: 'APP_STORE',
  isSteady: false,
  canceledAt: null,
  totalPaidAmount: 135000,
  latestCheckup: null,
  pastCheckupAverage: null,
  ...over,
});
const SUBMIT = { name: '해지 방법 보기' };

const renderCancel = async ({
  response = detail(),
  checkupId,
}: { response?: object; checkupId?: string } = {}) => {
  mockApi({
    'GET /api/v1/subscriptions/netflix': response,
    'PATCH /api/v1/checkups/c1/decision': { checkupId: 'c1', decision: 'CANCEL' },
  });
  await renderRouter(
    {
      index: () => <CheckupCancelScreen id="netflix" checkupId={checkupId} />,
      'cancel/[id]': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  await screen.findByText(/해지하려는 이유를 알려주세요/);
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};
const decisionBody = () => {
  const call = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'PATCH');
  return call && JSON.parse(String(call[1]?.body));
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('CheckupCancelScreen', () => {
  it('이유를 여러 개 고를 수 있고, 하나라도 고르면 해지 방법 보기가 활성화된다', async () => {
    const user = await renderCancel();
    expect(screen.getByText('넷플릭스를 해지하려는 이유를 알려주세요')).toBeOnTheScreen();
    expect(screen.getByRole('button', SUBMIT)).toBeDisabled();

    await user.press(screen.getByRole('checkbox', { name: '요즘 잘 안 봐요' }));
    await user.press(screen.getByRole('checkbox', { name: '보고 싶던 작품을 다 봤어요' }));
    expect(screen.getByRole('checkbox', { name: '요즘 잘 안 봐요' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '보고 싶던 작품을 다 봤어요' })).toBeChecked();
    expect(screen.getByRole('button', SUBMIT)).toBeEnabled();

    // 다시 누르면 해제
    await user.press(screen.getByRole('checkbox', { name: '요즘 잘 안 봐요' }));
    await user.press(screen.getByRole('checkbox', { name: '보고 싶던 작품을 다 봤어요' }));
    expect(screen.getByRole('checkbox', { name: '요즘 잘 안 봐요' })).not.toBeChecked();
    expect(screen.getByRole('button', SUBMIT)).toBeDisabled();
  });

  it('직접 입력은 내용이 있어야 활성화되고, 공백만 쓰면 비활성이다', async () => {
    const user = await renderCancel();
    expect(screen.queryByLabelText('해지 이유 직접 입력')).toBeNull();

    await user.press(screen.getByRole('checkbox', { name: '직접 입력' }));
    const input = screen.getByLabelText('해지 이유 직접 입력');
    expect(screen.getByRole('button', SUBMIT)).toBeDisabled();

    await user.type(input, '   ');
    expect(screen.getByRole('button', SUBMIT)).toBeDisabled();

    await user.type(input, '가족 계정으로 봐요');
    expect(screen.getByRole('button', SUBMIT)).toBeEnabled();

    // 직접 입력을 끄면 입력란이 사라지고 내용은 반영 안 됨
    await user.press(screen.getByRole('checkbox', { name: '직접 입력' }));
    expect(screen.queryByLabelText('해지 이유 직접 입력')).toBeNull();
    expect(screen.getByRole('button', SUBMIT)).toBeDisabled();
  });

  it('기타 카테고리 구독은 기타 해지 이유를 보여준다', async () => {
    await renderCancel({ response: detail({ serviceName: 'iCloud+', category: 'ETC' }) });

    expect(screen.getByText('iCloud+를 해지하려는 이유를 알려주세요')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: '기대한 기능이 없어요' })).toBeOnTheScreen();
  });

  it('점검에서 왔으면 고른 이유를 코드로, 직접 입력은 글로 저장하고 해지 안내로 간다', async () => {
    const user = await renderCancel({ checkupId: 'c1' });

    // 넷플릭스(OTT): 잘 안 봄 = RARELY_USED, 다 봤음 = GOAL_ACHIEVED
    await user.press(screen.getByRole('checkbox', { name: '요즘 잘 안 봐요' }));
    await user.press(screen.getByRole('checkbox', { name: '보고 싶던 작품을 다 봤어요' }));
    await user.press(screen.getByRole('checkbox', { name: '직접 입력' }));
    await user.type(screen.getByLabelText('해지 이유 직접 입력'), ' 가족 계정으로 봐요 ');
    await user.press(screen.getByRole('button', SUBMIT));

    await waitFor(() => expect(screen).toHavePathname('/cancel/netflix'));
    expect(decisionBody()).toEqual({
      decision: 'CANCEL',
      cancelReasons: ['RARELY_USED', 'GOAL_ACHIEVED', 'CUSTOM'],
      cancelReasonText: '가족 계정으로 봐요',
    });
  });

  it('점검에서 왔으면 건너뛰기도 이유 없이 해지 결정을 저장한다', async () => {
    const user = await renderCancel({ checkupId: 'c1' });

    await user.press(screen.getByRole('checkbox', { name: '요즘 잘 안 봐요' }));
    await user.press(screen.getByRole('button', { name: '건너뛰기' }));

    await waitFor(() => expect(screen).toHavePathname('/cancel/netflix'));
    expect(decisionBody()).toEqual({ decision: 'CANCEL' });
  });

  it('구독 상세에서 바로 왔으면(점검 없음) 저장 없이 해지 안내로 간다', async () => {
    const user = await renderCancel();

    await user.press(screen.getByRole('checkbox', { name: '요즘 잘 안 봐요' }));
    await user.press(screen.getByRole('button', SUBMIT));

    expect(screen).toHavePathname('/cancel/netflix');
    expect(decisionBody()).toBeUndefined();
  });
});
