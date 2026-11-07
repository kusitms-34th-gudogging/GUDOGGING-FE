import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getRegisteredServices,
  hasRegisterDraft,
  useRegisterDraft,
} from '@/hooks/useRegisterDraft';

beforeEach(async () => {
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});

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

  it('등록 완료 목록은 넘겨받은 항목만 보여주고, 직접 입력은 저장한 이름을 쓴다', () => {
    const payment = {
      category: '기타',
      amount: 9900,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'web' as const,
    };
    const payments = {
      'custom-a': { ...payment, name: '밀리의 서재' },
      'custom-b': { ...payment, name: '체크 해제한 구독' },
    };

    expect(getRegisteredServices(['netflix', 'custom-a'], payments)).toEqual([
      { id: 'netflix', name: 'Netflix' },
      { id: 'custom-a', name: '밀리의 서재' },
    ]);
  });
});
