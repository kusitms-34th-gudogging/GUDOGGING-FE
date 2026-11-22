import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { PaymentInfo } from '@/constants/services';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { useSyncSubscriptionDraft } from '@/hooks/useSubscriptionDraft';
import { createQueryWrapper, mockApi, TEST_FOUND, TEST_SERVICES } from '@/lib/testing';

const DRAFTS = '/api/v1/subscriptions/drafts';
const PAYMENT: PaymentInfo = {
  category: '영상·OTT',
  amount: 13500,
  cycle: 1,
  unit: '개월',
  nextDate: new Date(2026, 11, 1),
  paidAt: 'appstore',
};

const startSync = async () => {
  mockApi({
    'GET /api/v1/services': { services: TEST_SERVICES },
    [`PUT ${DRAFTS}`]: { savedAt: '2026-11-18T10:00:00' },
    [`DELETE ${DRAFTS}`]: null,
  });
  await renderHook(() => useSyncSubscriptionDraft(), { wrapper: createQueryWrapper() });
  // 서비스 이름을 쓰려고 서비스 목록을 받은 뒤부터 동기화 → 응답 처리까지 기다림
  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
};
const draftCalls = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([url]) => String(url).endsWith(DRAFTS))
    .map(([, init]) => ({
      method: init?.method,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    }));

beforeEach(async () => {
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => jest.restoreAllMocks());

describe('useSyncSubscriptionDraft', () => {
  it('들어올 때는 보내지 않고, 고른 서비스가 바뀌면 머문 화면과 함께 임시저장한다', async () => {
    await startSync();
    expect(draftCalls()).toEqual([]);

    // 머문 화면만 바뀌고 담을 구독이 없으면 보내지 않음
    await act(() => useRegisterDraft.getState().setLastStep('SELECT_SERVICES'));
    await act(() => useRegisterDraft.getState().setSelectedIds(['netflix']));

    await waitFor(() => expect(draftCalls()).toHaveLength(1));
    expect(draftCalls().at(-1)).toEqual({
      method: 'PUT',
      body: {
        // INPUT_SUBSCRIPTION이 아니면 editingItemIndex는 보내지 않음 (명세)
        lastStep: 'SELECT_SERVICES',
        // 결제 정보 입력 전엔 카테고리까지 6개 모두 null (명세)
        items: [
          {
            serviceId: 'netflix',
            serviceName: 'Netflix',
            category: null,
            amount: null,
            billingCycleValue: null,
            billingCycleUnit: null,
            nextBillingDate: null,
            paymentMethod: null,
          },
        ],
      },
    });
  });

  it('결제 정보와 직접 입력한 구독을 담고, 분석으로 불러온 구독은 빼고 보낸다', async () => {
    await startSync();

    await act(() => {
      useRegisterDraft.getState().setFound('SCREENSHOT', TEST_FOUND);
      useRegisterDraft.getState().setPayment('custom-found-millie', { ...PAYMENT, name: '밀리' });
      useRegisterDraft.getState().setSelectedIds(['netflix']);
      useRegisterDraft.getState().setPayment('netflix', PAYMENT);
      useRegisterDraft.getState().setPayment('custom-1', {
        ...PAYMENT,
        name: '동네 헬스장',
        category: '기타',
        cycle: 3,
      });
    });

    await waitFor(() =>
      expect(draftCalls().at(-1)?.body.items).toEqual([
        {
          serviceId: 'netflix',
          serviceName: 'Netflix',
          category: 'VIDEO_OTT',
          amount: 13500,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-12-01',
          paymentMethod: 'APP_STORE',
        },
        {
          serviceId: null,
          serviceName: '동네 헬스장',
          category: 'ETC',
          amount: 13500,
          billingCycleValue: 3,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-12-01',
          paymentMethod: 'APP_STORE',
        },
      ]),
    );
  });

  it('정보 입력 중이면 입력 중인 항목의 순번을, 새 직접 입력이면 null을 보낸다', async () => {
    await startSync();
    await act(() => {
      useRegisterDraft.getState().setSelectedIds(['netflix', 'tving']);
      useRegisterDraft.getState().setLastStep('INPUT_SUBSCRIPTION', 'tving');
    });
    await waitFor(() =>
      expect(draftCalls().at(-1)?.body).toMatchObject({
        lastStep: 'INPUT_SUBSCRIPTION',
        editingItemIndex: 1,
      }),
    );

    await act(() => useRegisterDraft.getState().setLastStep('INPUT_SUBSCRIPTION'));
    await waitFor(() =>
      expect(draftCalls().at(-1)?.body).toMatchObject({
        lastStep: 'INPUT_SUBSCRIPTION',
        editingItemIndex: null,
      }),
    );
  });

  it('입력 중인 항목이 임시저장 목록에 없으면 선택한 구독 화면으로 보낸다', async () => {
    await startSync();
    await act(() => {
      useRegisterDraft.getState().setSelectedIds(['netflix']);
      useRegisterDraft.getState().setLastStep('INPUT_SUBSCRIPTION', 'found-youtube');
    });

    await waitFor(() => expect(draftCalls().at(-1)?.body.lastStep).toBe('CONFIRM_SUBSCRIPTIONS'));
    expect(draftCalls().at(-1)?.body).not.toHaveProperty('editingItemIndex');
  });

  it('직접 등록 내용과 상관없는 변경(분석 결과 체크)엔 보내지 않는다', async () => {
    await startSync();

    await act(() => useRegisterDraft.getState().setFoundChecked(['found-youtube']));

    expect(draftCalls()).toEqual([]);
  });

  it('다 비우면(새로 등록하기·등록 완료) 서버 임시저장도 지운다', async () => {
    await startSync();
    await act(() => useRegisterDraft.getState().setSelectedIds(['netflix']));
    await waitFor(() => expect(draftCalls()).toHaveLength(1));

    await act(() => useRegisterDraft.getState().reset());

    await waitFor(() => expect(draftCalls().at(-1)?.method).toBe('DELETE'));
  });
});
