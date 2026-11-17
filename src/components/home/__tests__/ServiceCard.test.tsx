import { render, screen, userEvent } from '@testing-library/react-native';

import { placeLogos, ServiceCard } from '@/components/home/ServiceCard';

const sub = (id: string) => ({ id });

describe('placeLogos', () => {
  it('받은 순서대로 놓고, 앞일수록 크게', () => {
    const logos = placeLogos([sub('soon'), sub('mid'), sub('late')]);

    expect(logos.map((l) => l.id)).toEqual(['soon', 'mid', 'late']);
    expect(logos.map((l) => l.size)).toEqual([36, 30, 29]);
  });

  it('최대 10개까지만 놓는다', () => {
    const subs = Array.from({ length: 12 }, (_, i) => sub(`s${i}`));

    const logos = placeLogos(subs);

    expect(logos).toHaveLength(10);
    expect(logos.at(-1)?.id).toBe('s9');
  });

  it('1~10개 어느 개수에서도 로고끼리 겹치지 않고 로고 영역(128×98) 안에 있다', () => {
    for (let n = 1; n <= 10; n++) {
      const logos = placeLogos(Array.from({ length: n }, (_, i) => sub(`s${i}`)));
      for (const a of logos) {
        expect(a.x).toBeGreaterThanOrEqual(0);
        expect(a.x + a.size).toBeLessThanOrEqual(128);
        expect(a.y).toBeGreaterThanOrEqual(0);
        expect(a.y + a.size).toBeLessThanOrEqual(98);
        for (const b of logos) {
          if (a === b) continue;
          const gap =
            Math.hypot(
              a.x + a.size / 2 - (b.x + b.size / 2),
              a.y + a.size / 2 - (b.y + b.size / 2),
            ) -
            (a.size + b.size) / 2;
          // 떠다니는 폭(위아래 2px)만큼 서로 가까워져도 닿지 않게
          expect(gap).toBeGreaterThan(4);
        }
      }
    }
  });

  it('구독이 없으면 로고를 놓지 않는다', () => {
    expect(placeLogos([])).toEqual([]);
  });
});

describe('ServiceCard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<ServiceCard label="구독 3개" logos={[sub('a')]} onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '구독 3개' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
