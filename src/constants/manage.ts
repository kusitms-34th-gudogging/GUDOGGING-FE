import type { PaidAt } from '@/constants/services';
import type { HomeSubscription } from '@/utils/homeSummary';

interface SubscriptionDetailBase extends HomeSubscription {
  logoUrl?: string;
  category: string;
  paidAt: PaidAt;
  startedAt: Date;
  // 연 환산 금액 (서버 계산)
  yearlyAmount: number;
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
    // 유지/해지를 골랐으면 그 결정 (안 골랐으면 없음)
    decision?: 'KEEP' | 'CANCEL';
    // 고른 해지 이유 문구와 직접 입력한 이유를 한 줄씩
    cancelReason?: string;
  };
}

// 상세 API가 상태를 함께 주고, 상세 라우트가 상태로 화면을 고름
export type SubscriptionDetail = ActiveSubscriptionDetail | EndedSubscriptionDetail;
