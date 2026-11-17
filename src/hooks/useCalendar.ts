import { useQuery } from '@tanstack/react-query';

import type { CalendarDaySubscription } from '@/components/calendar/CalendarDay';
import type { PaidAt } from '@/constants/services';
import { request } from '@/lib/request';
import { type ApiCycleUnit, type ApiPaymentMethod, CYCLE_UNIT, PAID_AT_OF } from '@/utils/apiCodes';
import type { HomeSubscription } from '@/utils/homeSummary';

interface CalendarResponse {
  monthlyTotal: number;
  currentMonthTotal: number;
  paymentCount: number;
  days: {
    date: string;
    totalAmount: number;
    payments: {
      subscriptionId: string;
      serviceName: string;
      logoUrl: string | null;
      amount: number;
      billingCycleValue: number;
      billingCycleUnit: ApiCycleUnit;
      paymentMethod: ApiPaymentMethod;
    }[];
  }[];
}

// 날짜 칸·목록 한 줄 (C-01·C-02)
export interface CalendarItem
  extends CalendarDaySubscription, Pick<HomeSubscription, 'amount' | 'cycle' | 'unit'> {
  paidAt: PaidAt;
}

// shortcut: 목서버 로고 URL이 실제 이미지가 아니라 placeholder, 실제 로고 URL이 오면 { uri: logoUrl }로
const LOGO = require('@/assets/images/logo_placeholder.png');

export const calendarKeys = {
  all: ['calendar'] as const,
  month: (year: number, month: number) => [...calendarKeys.all, { year, month }] as const,
};

// month는 1~12
export const useCalendar = (year: number, month: number) =>
  useQuery({
    queryKey: calendarKeys.month(year, month),
    queryFn: ({ signal }) =>
      request<CalendarResponse>(`/api/v1/calendar?year=${year}&month=${month}`, { signal }),
    select: (data) => ({
      currentMonthTotal: data.currentMonthTotal,
      // 날짜(yyyy-MM-dd)별 결제
      byDate: new Map(
        data.days.map((d): [string, CalendarItem[]] => [
          d.date,
          d.payments.map((p) => ({
            id: p.subscriptionId,
            name: p.serviceName,
            // shortcut: 명세 캘린더 응답에 카테고리가 없어 기타, 서비스명 표시(display='name') 색은 카테고리 오면 반영
            category: 'etc',
            logo: LOGO,
            amount: p.amount,
            cycle: p.billingCycleValue,
            unit: CYCLE_UNIT[p.billingCycleUnit],
            paidAt: PAID_AT_OF[p.paymentMethod],
          })),
        ]),
      ),
    }),
  });
