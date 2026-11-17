import type { PaidAt } from '@/constants/services';
import type { HomeSubscription } from '@/utils/homeSummary';

// API 코드값 ↔ 화면에서 쓰는 값

export type ApiCategory =
  | 'VIDEO_OTT'
  | 'MUSIC'
  | 'SHOPPING_DELIVERY'
  | 'EDUCATION'
  | 'PRODUCTIVITY_AI'
  | 'ENTERTAINMENT'
  | 'ETC';
export type ApiCycleUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
export type ApiPaymentMethod = 'APP_STORE' | 'GOOGLE_PLAY' | 'WEB_DIRECT';
export type ApiStage =
  'KEEP_RECOMMENDED' | 'KEEP_CONSIDER' | 'CANCEL_CONSIDER' | 'CANCEL_RECOMMENDED';

// 등록 화면 카테고리 이름 (toCheckupCategory가 이 이름으로 점검 카테고리를 고름)
export const CATEGORY_LABEL: Record<ApiCategory, string> = {
  VIDEO_OTT: '영상·OTT',
  MUSIC: '음악',
  SHOPPING_DELIVERY: '쇼핑·배달 멤버십',
  EDUCATION: '교육·학습',
  PRODUCTIVITY_AI: '생산성·AI',
  ENTERTAINMENT: '엔터테인먼트',
  ETC: '기타',
};

export const CYCLE_UNIT: Record<ApiCycleUnit, HomeSubscription['unit']> = {
  DAY: '일',
  WEEK: '주',
  MONTH: '개월',
  YEAR: '년',
};

export const PAID_AT_OF: Record<ApiPaymentMethod, PaidAt> = {
  APP_STORE: 'appstore',
  GOOGLE_PLAY: 'playstore',
  WEB_DIRECT: 'web',
};

// 예: 유지 추천(92%)
// 임의: 명세에 단계별 문구가 없어 KEEP_CONSIDER·CANCEL_CONSIDER는 '유지 고려'·'해지 고려'
const STAGE_LABEL: Record<ApiStage, string> = {
  KEEP_RECOMMENDED: '유지 추천',
  KEEP_CONSIDER: '유지 고려',
  CANCEL_CONSIDER: '해지 고려',
  CANCEL_RECOMMENDED: '해지 추천',
};
export const formatStage = (stage: ApiStage, score: number) => `${STAGE_LABEL[stage]}(${score}%)`;

// 화면 값 → API 코드 (등록·수정 요청)
const invert = <K extends string, V extends string>(map: Record<K, V>) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<V, K>;

// 등록 화면 카테고리 이름은 '쇼핑·멤버십', 점검 쪽은 '쇼핑·배달 멤버십'이라 둘 다 받음. 모르는 이름은 기타
const CATEGORY_CODE: Record<string, ApiCategory> = {
  ...invert(CATEGORY_LABEL),
  '쇼핑·멤버십': 'SHOPPING_DELIVERY',
};
export const toCategoryCode = (label?: string): ApiCategory =>
  (label && CATEGORY_CODE[label]) || 'ETC';
export const toCycleUnitCode = (unit: string) =>
  invert(CYCLE_UNIT)[unit as HomeSubscription['unit']] ?? 'MONTH';
export const toPaymentMethodCode = (paidAt: PaidAt) => invert(PAID_AT_OF)[paidAt];
