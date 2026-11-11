import { type HomeSubscription, monthly } from '@/utils/homeSummary';

const MAX_ROWS = 5;

// K-80 카테고리 지출: 점검 중인 구독을 맨 위로, 월 환산 합계. 5개 넘으면 4개 + 그 외 n개
export const categorySpending = (currentId: string, subs: HomeSubscription[]) => {
  const sorted = [
    ...subs.filter((s) => s.id === currentId),
    ...subs.filter((s) => s.id !== currentId),
  ].map((s) => ({ ...s, monthly: monthly(s) }));
  const items = sorted.length > MAX_ROWS ? sorted.slice(0, MAX_ROWS - 1) : sorted;
  return {
    items,
    rest: sorted.length - items.length,
    total: sorted.reduce((sum, s) => sum + s.monthly, 0),
  };
};
