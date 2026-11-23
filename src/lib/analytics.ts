import { getAnalytics, logEvent, setUserId } from '@react-native-firebase/analytics';

import { request } from '@/lib/request';

// GA4 이벤트 (노션 "GA 세팅"). 이름·파라미터는 snake_case, 값 100자 이내
type RegisterMethod = 'manual' | 'screenshot' | 'gmail';
type Recommendation = 'keep' | 'cancel';
export type GuideType = 'app_store' | 'google_play' | 'web' | 'no_link';
// 구독 관련 이벤트 공통 파라미터
interface SubscriptionParams {
  service_name: string;
  category: string;
}

interface AnalyticsEvents {
  reg_start: { method: RegisterMethod; entry_point: 'onboarding' | 'home' | 'list' };
  reg_import_result: {
    method: Exclude<RegisterMethod, 'manual'>;
    result: 'success' | 'empty' | 'fail';
    found_count: number;
  };
  reg_complete: { method: RegisterMethod; registered_count: number };
  // ponytail: amount(결제 예정 금액)는 푸시 payload·알림 목록 응답에 없어 뺌, 서버가 주면 추가
  push_open: { open_from: 'push' | 'inbox' };
  check_start: SubscriptionParams & { entry_point: CheckEntry };
  // 4(메모)는 answer 없음
  check_answer: SubscriptionParams & { step: number; answer?: number };
  check_result_view: SubscriptionParams & { score: number; recommendation: Recommendation };
  check_decision: SubscriptionParams & { decision: Recommendation; recommendation: Recommendation };
  cancel_guide_view: SubscriptionParams & { guide_type: GuideType };
  cancel_complete: SubscriptionParams & {
    // 해지 확인 알림에서 바로 온 경우(push)는 안내를 거치지 않아 없음
    guide_type?: GuideType;
    amount: number;
    cancel_from: 'guide' | 'push';
  };
  // GA 맞춤 측정기준은 문자열로 보는 게 편해서 'true'·'false'
  steady_toggle: SubscriptionParams & { enabled: 'true' | 'false' };
}

// 점검 진입 경로. 화면 이동 때 ?from=으로 넘김
export type CheckEntry = 'push' | 'home' | 'detail';

// 활용도 60% 이상이면 유지 추천 (노션 파라미터 설명)
export const recommendationOf = (score: number): Recommendation =>
  score >= 60 ? 'keep' : 'cancel';

// 수집 실패가 앱 동작을 막지 않게 오류는 버림
export const track = <K extends keyof AnalyticsEvents>(name: K, params: AnalyticsEvents[K]) => {
  // logEvent는 이름별 오버로드라 제네릭 이름이면 반환 타입이 void로 잡힘 → Promise로 감쌈
  Promise.resolve()
    .then(() => logEvent(getAnalytics(), name, params))
    .catch(() => {});
};

// 로그인 상태면 회원 ID를 user_id로 (이메일 등 개인정보는 넣지 않음). 로그아웃·탈퇴는 null
export const identifyUser = () => {
  request<{ userId: string }>('/api/v1/users/me')
    .then(({ userId }) => setUserId(getAnalytics(), userId))
    .catch(() => {});
};
export const clearAnalyticsUser = () => {
  setUserId(getAnalytics(), null).catch(() => {});
};
