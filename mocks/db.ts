// 목서버 메모리 저장소. 서버를 다시 켜면 처음 상태로 돌아감
// 구독·점검·임시저장은 빈 상태로 시작해 POST로 쌓이고, 알림·서비스 목록 등 서버가 원래 가진 데이터는 고정

export type CycleUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface Subscription {
  subscriptionId: string;
  serviceId: string | null;
  serviceName: string;
  logoUrl: string | null;
  category: string;
  amount: number;
  billingCycleValue: number;
  billingCycleUnit: CycleUnit;
  // 등록 때 받은 다음 결제일. 실제 다음 결제일은 nextBilling()으로 오늘 기준 계산
  nextBillingDate: string;
  paymentMethod: string;
  startedAt: string;
  status: 'ACTIVE' | 'ENDED';
  canceledAt: string | null;
  isSteady: boolean;
}

export type AnswerType = 'USAGE' | 'SATISFACTION' | 'PLAN';

export interface Checkup {
  checkupId: string;
  subscriptionId: string;
  checkedAt: string;
  answers: Record<AnswerType, number>;
  // 고른 선택지 문구 (상세·결과의 usageAnswer 등)
  answerTexts: Record<AnswerType, string>;
  memo: string | null;
  score: number;
  stage: string;
  decision: 'KEEP' | 'CANCEL' | null;
  cancelReasons: string[];
  cancelReasonText: string | null;
}

export const db = {
  subscriptions: [] as Subscription[],
  checkups: [] as Checkup[],
  draft: null as null | {
    savedAt: string;
    lastStep: string;
    editingItemIndex: number | null;
    items: unknown[];
  },
  paymentReminderEnabled: true,
  gmailEmail: null as string | null,
  // 한 번 로그인하면 가입한 계정 (다음 로그인부터 isNewUser false → 온보딩 없이 홈)
  registered: false,
  readNotificationIds: new Set<string>(),
};

export const uuid = () => crypto.randomUUID();

// 날짜는 명세대로 yyyy-MM-dd 문자열, 계산은 로컬 자정 Date로
export const toDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = () => toDate(toIso(new Date()));
export const nowIso = () => new Date().toISOString().slice(0, 19);

const DAY = 24 * 60 * 60 * 1000;
export const daysBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / DAY);

// 기준 결제일에서 주기 k번 뒤(음수면 앞). 월·년은 말일을 넘기면 그 달 말일
const shift = (anchor: Date, s: Subscription, k: number) => {
  const n = s.billingCycleValue * k;
  const { billingCycleUnit: unit } = s;
  if (unit === 'DAY' || unit === 'WEEK') {
    return new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate() + n * (unit === 'WEEK' ? 7 : 1),
    );
  }
  const months = unit === 'MONTH' ? n : n * 12;
  const target = new Date(anchor.getFullYear(), anchor.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(anchor.getDate(), lastDay));
};

// from~to(포함) 사이 결제일. 등록 전 기간도 같은 주기로 결제됐다고 봄
export const billingDates = (s: Subscription, from: Date, to: Date) => {
  const anchor = toDate(s.nextBillingDate);
  let k = 0;
  // 기준일이 범위 뒤면 앞으로, 앞이면 뒤로 옮겨 from 이후 첫 결제일을 찾음
  while (shift(anchor, s, k - 1) >= from) k--;
  while (shift(anchor, s, k) < from) k++;
  const dates: Date[] = [];
  for (; shift(anchor, s, k) <= to; k++) dates.push(shift(anchor, s, k));
  return dates;
};

// 오늘 이후 첫 결제일
// from 이후(포함) 첫 결제일. from부터 한 주기 안에 결제일이 반드시 하나 있음
export const nextBilling = (s: Subscription, from = today()) =>
  billingDates(s, from, shift(from, s, 1))[0];

export const monthlyAmount = (s: Subscription) => {
  const perMonth = { DAY: 365 / 12, WEEK: 52 / 12, MONTH: 1, YEAR: 1 / 12 }[s.billingCycleUnit];
  return Math.round((s.amount * perMonth) / s.billingCycleValue);
};

export const findSubscription = (id: string) =>
  db.subscriptions.find((s) => s.subscriptionId === id);

export const latestCheckup = (subscriptionId: string) =>
  db.checkups.filter((c) => c.subscriptionId === subscriptionId).at(-1);

// 점검 점수·단계 (명세 "구독 점검 제출" 공식)
export const scoreCheckup = ({
  USAGE: u,
  SATISFACTION: s,
  PLAN: p,
}: Record<AnswerType, number>) => {
  const raw = Math.round(((u - 1) / 4) * 40 + ((s - 1) / 4) * 25 + ((p - 1) / 4) * 35);
  const score = p === 1 ? Math.min(raw, 59) : raw;
  const stage =
    score >= 80
      ? 'KEEP_RECOMMENDED'
      : score >= 60
        ? 'KEEP_CONSIDER'
        : score >= 40
          ? 'CANCEL_CONSIDER'
          : 'CANCEL_RECOMMENDED';
  return { score, stage };
};

// 서버를 켜면 기본으로 있는 구독 1건. 결제일은 오늘 기준이라 언제 켜도 '다가오는 결제'에 보임
// id는 고정 알림의 subscriptionId와 같아서 알림을 누르면 이 구독으로 감
const seedDate = (days: number, months = 0) => {
  const d = today();
  return toIso(new Date(d.getFullYear(), d.getMonth() + months, d.getDate() + days));
};
db.subscriptions.push({
  subscriptionId: '3f2b8c1e-5a4d-4e7b-9c21-000000000001',
  serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000001',
  serviceName: 'Netflix',
  logoUrl: 'https://cdn.gudogging.com/logos/netflix.png',
  category: 'VIDEO_OTT',
  amount: 13500,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  nextBillingDate: seedDate(3),
  paymentMethod: 'APP_STORE',
  startedAt: seedDate(3, -6),
  status: 'ACTIVE',
  canceledAt: null,
  isSteady: false,
});

// 구독 종료 화면(M-05·캘린더 회색 상세) 확인용으로 처음부터 해지된 구독 1건 + 해지를 고른 마지막 점검
// 해지일 10일 전이라 캘린더에 지난 결제가 남음
db.subscriptions.push({
  subscriptionId: '3f2b8c1e-5a4d-4e7b-9c21-000000000099',
  serviceId: null,
  serviceName: '왓챠',
  logoUrl: null,
  category: 'VIDEO_OTT',
  amount: 7900,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  nextBillingDate: seedDate(-10),
  paymentMethod: 'WEB_DIRECT',
  startedAt: seedDate(-10, -6),
  status: 'ENDED',
  canceledAt: seedDate(-10),
  isSteady: false,
});
db.checkups.push({
  checkupId: 'b1d7a2c4-5a4d-4e7b-9c21-000000000099',
  subscriptionId: '3f2b8c1e-5a4d-4e7b-9c21-000000000099',
  checkedAt: seedDate(-12),
  answers: { USAGE: 1, SATISFACTION: 1, PLAN: 1 },
  answerTexts: { USAGE: '안 봤어요', SATISFACTION: '많이 아까워요', PLAN: '안 쓸 거예요' },
  memo: '볼 게 없어서 해지',
  ...scoreCheckup({ USAGE: 1, SATISFACTION: 1, PLAN: 1 }),
  decision: 'CANCEL',
  cancelReasons: ['RARELY_USED', 'CUSTOM'],
  cancelReasonText: '요즘 볼 게 없어요',
});

// E2E 초기화용: 시드까지 넣은 처음 상태를 복사해 둠 (handlers/e2e.ts)
const initial = structuredClone(db);
export const resetDb = () => Object.assign(db, structuredClone(initial));
