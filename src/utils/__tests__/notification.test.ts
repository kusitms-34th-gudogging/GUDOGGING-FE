import { formatReceivedAt, groupNotifications } from '@/utils/notification';

const NOW = new Date(2026, 10, 17, 15, 0, 0); // 11월 17일 15:00
const at = (month: number, day: number, h = 0, m = 0, s = 0) =>
  new Date(2026, month - 1, day, h, m, s);

describe('formatReceivedAt', () => {
  it.each([
    [at(11, 17, 14, 59, 30), '방금 전'],
    [at(11, 17, 14, 59, 0), '1분 전'],
    [at(11, 17, 14, 1), '59분 전'],
    [at(11, 17, 14, 0), '1시간 전'],
    [at(11, 16, 15, 0, 1), '23시간 전'],
    [at(11, 16, 15), '11월 16일'],
    [at(10, 3, 9), '10월 3일'],
  ])('%s → %s', (receivedAt, expected) => {
    expect(formatReceivedAt(receivedAt, NOW)).toBe(expected);
  });
});

describe('groupNotifications', () => {
  it('오늘 받은 건 오늘, 나머지는 이전 알림으로 최신순, 30일 지난 건 뺀다', () => {
    const list = [
      { id: 'yesterday', receivedAt: at(11, 16, 23) },
      { id: 'morning', receivedAt: at(11, 17, 9) },
      { id: 'old', receivedAt: at(10, 18, 15) }, // 정확히 30일 전
      { id: 'noon', receivedAt: at(11, 17, 12) },
      { id: 'week', receivedAt: at(11, 10, 8) },
    ];

    const { today, previous } = groupNotifications(list, NOW);

    expect(today.map((n) => n.id)).toEqual(['noon', 'morning']);
    expect(previous.map((n) => n.id)).toEqual(['yesterday', 'week']);
  });
});
