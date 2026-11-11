import type { PaidAt } from '@/constants/services';
import type { HomeSubscription } from '@/utils/homeSummary';

interface SubscriptionDetailBase extends HomeSubscription {
  category: string;
  paidAt: PaidAt;
  startedAt: Date;
}

// 구독 중 (M-03)
export interface ActiveSubscriptionDetail extends SubscriptionDetailBase {
  status: 'active';
  // 꾸준히 쓰는 구독: 점검 알림 없이 유지
  steady: boolean;
  lastCheckup?: {
    period: string;
    result: string;
    usage: string;
    satisfaction: string;
    plan: string;
  };
}

// 지난 구독 (M-05)
export interface EndedSubscriptionDetail extends SubscriptionDetailBase {
  status: 'ended';
  cancelledAt: Date;
  totalSpent: number;
  lastCheckup?: {
    checkedAt: Date;
    result: string;
    usage: string;
    satisfaction: string;
    plan: string;
    cancelReason?: string;
  };
}

// 상세 API가 상태를 함께 주고, 상세 라우트가 상태로 화면을 고름
export type SubscriptionDetail = ActiveSubscriptionDetail | EndedSubscriptionDetail;

const inDays = (n: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
};
const monthly = { cycle: 1, unit: '개월' } as const;

// shortcut: 구독 API 없이 오늘 기준 샘플, 구독 목록·상세 API 연동 시 API 훅으로 교체
// 점검 화면이 점검 샘플(CHECKUP_SAMPLE)에서 서비스를 찾으므로 같은 id를 씀
export const MANAGE_SAMPLE: SubscriptionDetail[] = [
  {
    status: 'active',
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    amount: 29000,
    ...monthly,
    nextDate: inDays(1),
    category: '생산성·AI',
    paidAt: 'appstore',
    startedAt: inDays(-120),
    steady: true,
  },
  {
    status: 'active',
    id: 'netflix',
    name: 'Netflix',
    amount: 13500,
    ...monthly,
    nextDate: inDays(1),
    category: '영상·OTT',
    paidAt: 'appstore',
    startedAt: inDays(-92),
    steady: false,
    lastCheckup: {
      period: '3월~6월 결과',
      result: '유지 추천(92%)',
      usage: '한 달 6~10편 봤어요',
      satisfaction: '보고 싶은 작품이 계속 생겨요',
      plan: '꼭 볼 작품이 있어요',
    },
  },
  {
    status: 'active',
    id: 'melon',
    name: '멜론',
    amount: 10900,
    ...monthly,
    nextDate: inDays(9),
    category: '음악',
    paidAt: 'web',
    startedAt: inDays(-300),
    steady: false,
  },
  {
    status: 'active',
    id: 'coupang',
    name: '쿠팡 와우',
    amount: 7890,
    ...monthly,
    nextDate: inDays(12),
    category: '쇼핑·멤버십',
    paidAt: 'web',
    startedAt: inDays(-400),
    steady: true,
  },
  {
    status: 'active',
    id: 'millie',
    name: '밀리의 서재',
    amount: 9900,
    ...monthly,
    nextDate: inDays(20),
    category: '도서',
    paidAt: 'playstore',
    startedAt: inDays(-60),
    steady: false,
  },
  {
    status: 'ended',
    id: 'watcha',
    name: '왓챠',
    amount: 7900,
    ...monthly,
    category: '영상·OTT',
    paidAt: 'web',
    startedAt: inDays(-209),
    cancelledAt: inDays(-26),
    totalSpent: 47400,
    lastCheckup: {
      checkedAt: inDays(-39),
      result: '해지 추천(8%)',
      usage: '한 달 동안 안 봤어요',
      satisfaction: '볼 게 별로 없어요',
      plan: '다음 달엔 안 봐요',
      cancelReason: '보고 싶던 작품을 다 봐서 새 시즌 나오면 다시 구독해야징',
    },
  },
  {
    status: 'ended',
    id: 'tving',
    name: '티빙',
    amount: 9900,
    ...monthly,
    category: '영상·OTT',
    paidAt: 'appstore',
    startedAt: inDays(-220),
    cancelledAt: inDays(-40),
    totalSpent: 59400,
  },
];
