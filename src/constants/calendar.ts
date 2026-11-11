import type { CalendarDaySubscription } from '@/components/calendar/CalendarDay';
import { toCheckupCategory } from '@/constants/checkup';
import type { PaidAt } from '@/constants/services';
import type { HomeSubscription } from '@/utils/homeSummary';

// 캘린더 결제 일정 한 건 (C-01·C-02 날짜 칸·목록, C-03 상세)
export interface CalendarPayment
  extends CalendarDaySubscription, Pick<HomeSubscription, 'amount' | 'cycle' | 'unit'> {
  // 매달 결제되는 날
  day: number;
  categoryLabel: string;
  paidAt: PaidAt;
  startedAt: Date;
  lastCheckup?: {
    checkedAt: Date;
    result: string;
    usage: string;
    satisfaction: string;
    plan: string;
    memo?: string;
  };
}

const LOGO = require('@/assets/images/logo_placeholder.png');

const pay = (
  day: number,
  id: string,
  name: string,
  categoryLabel: string,
  amount: number,
  paidAt: PaidAt,
  extra?: Pick<CalendarPayment, 'lastCheckup'>,
): CalendarPayment => ({
  day,
  id,
  name,
  categoryLabel,
  category: toCheckupCategory(categoryLabel),
  logo: LOGO,
  amount,
  cycle: 1,
  unit: '개월',
  paidAt,
  startedAt: new Date(2026, 6, day),
  ...extra,
});

const checkup = (
  month: number,
  day: number,
  result: string,
  usage: string,
  satisfaction: string,
  plan: string,
  memo?: string,
): Pick<CalendarPayment, 'lastCheckup'> => ({
  lastCheckup: {
    checkedAt: new Date(2026, month - 1, day),
    result,
    usage,
    satisfaction,
    plan,
    memo,
  },
});

// shortcut: 렌더 확인용 샘플이라 모든 달 같은 날짜에 보임, 캘린더 API 연동 시 API 훅으로 교체
// Figma C-01~C-03 예시 (이번 달 합계 142,400원, 17일 3건 · 57,400원, 넷플릭스 상세)
// 점검 없는 상세도 확인하도록 유튜브 프리미엄·웨이브는 점검 기록 없음
export const CALENDAR_SAMPLE: CalendarPayment[] = [
  pay(
    3,
    'notion',
    '노션',
    '생산성·AI',
    14000,
    'web',
    checkup(
      10,
      1,
      '유지 추천(85%)',
      '주 5일 이상 썼어요',
      '업무에 꼭 필요해요',
      '계속 쓸 거예요',
      '팀 회의록 정리용으로 계속 씀',
    ),
  ),
  pay(
    8,
    'figma',
    '피그마',
    '생산성·AI',
    22000,
    'web',
    checkup(
      10,
      5,
      '유지 추천(88%)',
      '주 3~4일 썼어요',
      '작업 시간이 줄었어요',
      '계속 쓸 거예요',
      '프로젝트 끝나면 무료 플랜으로 바꿀지 고민',
    ),
  ),
  pay(
    12,
    'claude',
    '클로드',
    '생산성·AI',
    29000,
    'appstore',
    checkup(
      10,
      9,
      '유지 추천(90%)',
      '매일 썼어요',
      '구독료만큼 가치 있어요',
      '계속 쓸 거예요',
      '코드 리뷰에 매일 씀',
    ),
  ),
  pay(
    17,
    'netflix',
    '넷플릭스',
    '영상·OTT',
    13500,
    'appstore',
    checkup(
      10,
      3,
      '유지 추천(92%)',
      '한 달 6~10편 봤어요',
      '보고 싶은 작품이 계속 생겨요',
      '꼭 볼 작품이 있어요',
      '시즌 3 공개돼서 이번 달은 유지할 생각임',
    ),
  ),
  pay(17, 'youtube', '유튜브 프리미엄', '영상·OTT', 14900, 'playstore'),
  pay(
    17,
    'chatgpt',
    'ChatGPT Plus',
    '생산성·AI',
    29000,
    'web',
    checkup(
      10,
      14,
      '고민 필요(54%)',
      '주 1~2일 썼어요',
      '다른 AI로도 충분해요',
      '고민 중이에요',
      '클로드랑 겹쳐서 다음 달에 하나 정리하기',
    ),
  ),
  pay(
    22,
    'adobe',
    '어도비',
    '생산성·AI',
    6600,
    'web',
    checkup(
      10,
      19,
      '해지 추천(28%)',
      '한 달에 한 번 썼어요',
      '거의 안 써요',
      '해지할래요',
      '포토샵 거의 안 열어봄, 이번 달 해지',
    ),
  ),
  pay(
    28,
    'melon',
    '멜론',
    '음악',
    4500,
    'appstore',
    checkup(
      10,
      25,
      '유지 추천(80%)',
      '매일 들었어요',
      '출퇴근길에 꼭 들어요',
      '계속 쓸 거예요',
      '가족 요금제로 바꾸면 더 싸질 듯',
    ),
  ),
  pay(
    28,
    'coupang',
    '쿠팡 와우',
    '쇼핑·배달 멤버십',
    4990,
    'web',
    checkup(
      10,
      25,
      '유지 추천(76%)',
      '한 달 8번 주문했어요',
      '배송비가 아껴져요',
      '계속 쓸 거예요',
      '배달비 무료라 주말마다 씀',
    ),
  ),
  pay(28, 'wavve', '웨이브', '영상·OTT', 3910, 'playstore'),
];

// 오늘 이후(오늘 포함) 처음 오는 결제일
export const nextPaymentDate = (day: number, today = new Date()) => {
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), day);
  return thisMonth >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
    ? thisMonth
    : new Date(today.getFullYear(), today.getMonth() + 1, day);
};
