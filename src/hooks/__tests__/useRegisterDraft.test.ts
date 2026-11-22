import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  getFoundServiceIds,
  hasRegisterDraft,
  useRegisterDraft,
  useRegisterServices,
} from '@/hooks/useRegisterDraft';
import { createQueryWrapper, mockApi, TEST_FOUND, TEST_SERVICES } from '@/lib/testing';

beforeEach(async () => {
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => jest.restoreAllMocks());

describe('useRegisterDraft', () => {
  it('저장소에서 다시 읽으면 결제일이 Date로 돌아온다', async () => {
    await AsyncStorage.setItem(
      'register-draft',
      JSON.stringify({
        state: {
          selectedIds: ['netflix'],
          payments: {
            netflix: {
              category: '영상·OTT',
              amount: 13500,
              cycle: 1,
              unit: '개월',
              nextDate: '2026-11-12T00:00:00.000Z',
              paidAt: 'web',
            },
          },
        },
        version: 0,
      }),
    );

    await useRegisterDraft.persist.rehydrate();

    const { nextDate } = useRegisterDraft.getState().payments.netflix;
    expect(nextDate).toBeInstanceOf(Date);
    expect(nextDate.toISOString()).toBe('2026-11-12T00:00:00.000Z');
  });

  it('고른 서비스·결제 정보·분석 체크 중 하나라도 있으면 등록 중으로 본다', () => {
    expect(hasRegisterDraft(useRegisterDraft.getState())).toBe(false);

    useRegisterDraft.getState().setFoundChecked([]);
    expect(hasRegisterDraft(useRegisterDraft.getState())).toBe(true);

    useRegisterDraft.getState().reset();
    expect(hasRegisterDraft(useRegisterDraft.getState())).toBe(false);
  });

  it('선택한 구독 목록에는 직접 입력한 구독만 들어가고, 불러온 구독을 수정한 값은 빠진다', async () => {
    const payment = {
      category: '교육·학습',
      amount: 9900,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'web' as const,
    };
    mockApi({ 'GET /api/v1/services': { services: TEST_SERVICES } });
    useRegisterDraft.getState().setFound('SCREENSHOT', TEST_FOUND);
    const { result } = await renderHook(() => useRegisterServices(['netflix']), {
      wrapper: createQueryWrapper(),
    });

    await act(() => {
      useRegisterDraft.getState().setPayment('custom-1', { ...payment, name: '직접 입력 구독' });
      // 불러온 밀리의 서재를 수정해 저장한 값
      useRegisterDraft
        .getState()
        .setPayment('custom-found-millie', { ...payment, name: '밀리의 서재' });
    });

    await waitFor(() =>
      expect(result.current.map((s) => s.name)).toEqual(['Netflix', '직접 입력 구독']),
    );
  });
});

describe('getFoundServiceIds', () => {
  // ChatGPT Plus·Netflix·YouTube Premium은 사전 등록 서비스로 인식, 밀리의 서재는 아님
  it('불러온 구독이 가리키는 사전 등록 서비스를 돌려준다', () => {
    expect(getFoundServiceIds(TEST_FOUND, {})).toEqual(['chatgpt', 'netflix', 'youtube']);
  });

  it('수정 화면에서 이름을 바꾼 구독은 다른 서비스로 보고 뺀다', () => {
    const payment = {
      category: '영상·OTT',
      amount: 13500,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 20),
      paidAt: 'web' as const,
    };
    expect(
      getFoundServiceIds(TEST_FOUND, {
        'found-netflix': { ...payment, name: '넷플 가족' },
        'found-youtube': { ...payment, name: 'YouTube Premium' },
      }),
    ).toEqual(['chatgpt', 'youtube']);
  });
});
