import {
  type HomeSubscription,
  lowUsage,
  monthDue,
  nextCheckupTarget,
  upcomingPayments,
  yearTotal,
} from '@/utils/homeSummary';

const TODAY = new Date(2026, 9, 16); // 10월 16일
const sub = (over: Partial<HomeSubscription> & { id: string }): HomeSubscription => ({
  name: over.id,
  amount: 10000,
  cycle: 1,
  unit: '개월',
  ...over,
});

describe('monthDue', () => {
  it('오늘~이번 달 말일에 결제일이 있는 구독만 더한다', () => {
    const subs = [
      sub({ id: 'a', amount: 13500, nextDate: new Date(2026, 9, 17) }),
      sub({ id: 'b', amount: 14900, nextDate: new Date(2026, 9, 31) }),
      sub({ id: 'c', amount: 9900, nextDate: new Date(2026, 10, 1) }), // 다음 달
      sub({ id: 'd', amount: 5000 }), // 결제일 없음
    ];

    expect(monthDue(subs, TODAY)).toBe(28400);
  });

  it('주기가 짧으면 이번 달 남은 기간에 여러 번 결제된다', () => {
    // 10/17, 10/24, 10/31 세 번
    expect(monthDue([sub({ id: 'w', unit: '주', nextDate: new Date(2026, 9, 17) })], TODAY)).toBe(
      30000,
    );
  });
});

describe('yearTotal', () => {
  it('등록 전 기간도 같은 주기로 결제됐다고 보고 1~12월을 더한다', () => {
    // 매월 17일 → 1~12월 12번, 1년 주기 → 올해 1번
    const subs = [
      sub({ id: 'm', amount: 13500, nextDate: new Date(2026, 9, 17) }),
      sub({ id: 'y', amount: 99000, unit: '년', nextDate: new Date(2026, 9, 20) }),
    ];

    expect(yearTotal(subs, TODAY)).toBe(13500 * 12 + 99000);
  });

  it('31일 결제는 짧은 달엔 말일로 결제되고, 말일 보정이 쌓이지 않는다', () => {
    // 1/31, 2/28, 3/31, … 12/31 → 12번
    expect(yearTotal([sub({ id: 'e', nextDate: new Date(2026, 9, 31) })], TODAY)).toBe(120000);
  });
});

describe('upcomingPayments', () => {
  it('7일 안 결제를 남은 날 적은 순, 같으면 금액 큰 순으로 최대 3개', () => {
    const subs = [
      sub({ id: 'later', nextDate: new Date(2026, 9, 22) }),
      sub({ id: 'cheap', amount: 5000, nextDate: new Date(2026, 9, 17) }),
      sub({ id: 'pricey', amount: 20000, nextDate: new Date(2026, 9, 17) }),
      sub({ id: 'mid', nextDate: new Date(2026, 9, 19) }),
      sub({ id: 'out', nextDate: new Date(2026, 9, 30) }), // 7일 넘음
    ];

    const { within7, items } = upcomingPayments(subs, TODAY);

    expect(within7).toBe(true);
    expect(items.map((s) => s.id)).toEqual(['pricey', 'cheap', 'mid']);
  });

  it('7일 안 결제가 없으면 가장 가까운 1건, 결제일이 모두 없으면 빈 목록', () => {
    const subs = [
      sub({ id: 'far', nextDate: new Date(2026, 10, 20) }),
      sub({ id: 'near', nextDate: new Date(2026, 9, 30) }),
    ];

    expect(upcomingPayments(subs, TODAY)).toEqual({ within7: false, items: [subs[1]] });
    expect(upcomingPayments([sub({ id: 'none' })], TODAY)).toEqual({ within7: false, items: [] });
  });
});

describe('lowUsage', () => {
  it('활용도 60% 미만만 결제일 가까운 순 최대 2개, 월 합계는 월 금액으로 환산해 더한다', () => {
    const subs = [
      sub({ id: 'high', usage: 80, nextDate: new Date(2026, 9, 17) }),
      sub({ id: 'low-late', usage: 30, nextDate: new Date(2026, 9, 25) }),
      sub({ id: 'low-soon', usage: 50, nextDate: new Date(2026, 9, 18) }),
      sub({
        id: 'low-year',
        usage: 10,
        amount: 120000,
        unit: '년',
        nextDate: new Date(2026, 11, 1),
      }),
      sub({ id: 'never' }), // 점검 기록 없음
    ];

    const { items, monthTotal } = lowUsage(subs);

    expect(items.map((s) => s.id)).toEqual(['low-soon', 'low-late']);
    expect(monthTotal).toBe(10000 + 10000 + 10000); // 연 12만 원 → 월 1만 원
  });
});

describe('nextCheckupTarget', () => {
  it('결제일이 가장 가까운 구독', () => {
    const subs = [
      sub({ id: 'far', nextDate: new Date(2026, 10, 20) }),
      sub({ id: 'near', nextDate: new Date(2026, 9, 18) }),
    ];

    expect(nextCheckupTarget(subs, TODAY)?.id).toBe('near');
  });
});
