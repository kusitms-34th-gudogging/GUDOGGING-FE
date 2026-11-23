import type { Href } from 'expo-router';

import type { NotificationKind } from '@/constants/notification';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
// 화면설계서 NOT-002: 최근 30일 보관
const KEEP_DAYS = 30;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// 1분 미만 '방금 전' / 1시간 미만 'N분 전' / 24시간 미만 'N시간 전' / 그 이후 'M월 D일'
export const formatReceivedAt = (receivedAt: Date, now: Date) => {
  const diff = now.getTime() - receivedAt.getTime();
  if (diff < MINUTE) return '방금 전';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  return `${receivedAt.getMonth() + 1}월 ${receivedAt.getDate()}일`;
};

// 최근 30일만, 최신순으로 '오늘'·'이전 알림'으로 나눔
export const groupNotifications = <T extends { receivedAt: Date }>(list: T[], now: Date) => {
  const kept = list
    .filter((n) => now.getTime() - n.receivedAt.getTime() < KEEP_DAYS * DAY)
    .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
  return {
    today: kept.filter((n) => isSameDay(n.receivedAt, now)),
    previous: kept.filter((n) => !isSameDay(n.receivedAt, now)),
  };
};

// 알림 목록·푸시 탭이 같은 규칙으로 이동 (화면설계서 NOT-001·002)
export const notificationTarget = (kind: NotificationKind, subscriptionId: string): Href => {
  switch (kind) {
    case 'checkup':
      return `/checkup/${subscriptionId}?restart=1&from=push`;
    case 'payment':
      return `/manage/detail/${subscriptionId}`;
    case 'cancel-confirm':
      return `/manage/detail/${subscriptionId}?confirmCancel=1`;
  }
};
