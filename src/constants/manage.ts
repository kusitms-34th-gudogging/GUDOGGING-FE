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
