import { categorySpending } from '@/utils/checkupResult';
import type { HomeSubscription } from '@/utils/homeSummary';

const sub = (id: string, over: Partial<HomeSubscription> = {}): HomeSubscription => ({
  id,
  name: id,
  amount: 10000,
  cycle: 1,
  unit: '개월',
  ...over,
});

it('점검 중인 구독을 맨 위로 올리고 연·주 결제는 월로 환산해 합산한다', () => {
  const result = categorySpending('b', [
    sub('a', { amount: 120000, unit: '년' }),
    sub('b', { amount: 13500 }),
    sub('c', { amount: 3000, unit: '주' }),
  ]);
  expect(result.items.map((s) => s.id)).toEqual(['b', 'a', 'c']);
  // 10,000 + 13,500 + 3,000×52÷12(13,000)
  expect(result.total).toBe(36500);
  expect(result.rest).toBe(0);
});

it('5개까지는 모두 보여 주고, 넘으면 4개 + 나머지 개수', () => {
  const five = ['a', 'b', 'c', 'd', 'e'].map((id) => sub(id));
  expect(categorySpending('a', five).items).toHaveLength(5);

  const six = categorySpending('f', [...five, sub('f')]);
  expect(six.items.map((s) => s.id)).toEqual(['f', 'a', 'b', 'c']);
  expect(six.rest).toBe(2);
  expect(six.total).toBe(60000);
});
