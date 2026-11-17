import { formatDate, parseDate } from '@/utils/date';

describe('parseDate', () => {
  it('yyyy-MM-dd를 그 날짜의 로컬 자정으로 바꾼다', () => {
    expect(parseDate('2026-11-05')).toEqual(new Date(2026, 10, 5));
  });
});

describe('formatDate', () => {
  it('월·일을 두 자리로 채운 yyyy-MM-dd로 바꾼다', () => {
    expect(formatDate(new Date(2026, 0, 7))).toBe('2026-01-07');
  });
});
