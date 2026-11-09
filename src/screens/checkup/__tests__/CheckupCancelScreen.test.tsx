import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { CheckupSubscription } from '@/constants/checkup';
import { CheckupCancelScreen } from '@/screens/checkup/CheckupCancelScreen';

const NETFLIX: CheckupSubscription = {
  id: 'netflix',
  name: 'Netflix',
  nameKo: '넷플릭스',
  category: '영상·OTT',
  amount: 13500,
  nextDate: new Date(2026, 10, 17),
};
const SUBMIT = { name: '해지 방법 보기' };

const renderCancel = async (subscription = NETFLIX) => {
  await renderRouter(
    { cancel: () => <CheckupCancelScreen subscription={subscription} /> },
    {
      initialUrl: '/cancel',
    },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

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

  it('카테고리 미지정 구독은 기타 해지 이유를 보여준다', async () => {
    await renderCancel({
      id: 'icloud',
      name: 'iCloud+',
      amount: 1100,
      nextDate: new Date(2026, 10, 2),
    });
    expect(screen.getByText('iCloud+를 해지하려는 이유를 알려주세요')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: '기대한 기능이 없어요' })).toBeOnTheScreen();
  });
});
