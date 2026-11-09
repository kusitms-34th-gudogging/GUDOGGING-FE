import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import {
  EducationColorAsset,
  EntertainmentColorAsset,
  EtcColorAsset,
  MusicColorAsset,
  OttColorAsset,
  ProductivityColorAsset,
  ShoppingColorAsset,
} from '@/assets/graphics';

export type CheckupCategory =
  'ott' | 'music' | 'shopping' | 'education' | 'productivity' | 'entertainment' | 'etc';

// 문항 1개. title의 {name}을·{name}으로 같은 조사는 서비스명 받침에 맞춰 바꿈 (utils/josa)
// hint의 {amount}는 월 구독료, {year}는 1년 구독료, {next}는 다음 결제(예: 11월 17일 · 13,500원)
export interface CheckupQuestion {
  title: string;
  hint: string;
  options: string[];
}

interface CheckupCategoryConfig {
  asset: ComponentType<SvgProps>;
  // 1/4 이용도 · 2/4 만족도 · 3/4 다음 달 계획
  questions: [CheckupQuestion, CheckupQuestion, CheckupQuestion];
  // 4/4 메모(K-70) 입력란 예시와 칩 3개 (계속 쓸 이유 · 이번 달 사정 · 해지 조건 순)
  memo: { placeholder: string; chips: [string, string, string] };
}

const USAGE = '최근 한 달 동안 {name}을 얼마나 자주 이용했나요?';
const PER_DAY = '하루에 여러 번 써도 1일로 세어 주세요';
const DAYS = ['안 썼어요', '한 달에 1~3일', '주 1~2일', '주 3~5일', '거의 매일'];
const VALUE_HINT = '월 {amount} · 1년이면 {year}';
const VALUE_OPTIONS = [
  '많이 아까워요',
  '조금 아까워요',
  '보통이에요',
  '구독료만큼 가치 있어요',
  '구독료보다 더 가치 있어요',
];
// 3/4 다음 달 계획은 카테고리 모두 같음
const PLAN: CheckupQuestion = {
  title: '다음 달에도 {name}을 이용할 계획이 있나요?',
  hint: '다음 결제 {next}',
  options: [
    '안 쓸 거예요',
    '거의 안 쓸 것 같아요',
    '아직 잘 모르겠어요',
    '아마 계속 쓸 것 같아요',
    '꼭 계속 쓸 거예요',
  ],
};
const value = (title: string): CheckupQuestion => ({
  title,
  hint: VALUE_HINT,
  options: VALUE_OPTIONS,
});

// Figma 06 구독 점검 화면 설계서(CHK-001~008) Description 문구 그대로. 선택지는 1점(부정)부터
export const CHECKUP_CATEGORIES: Record<CheckupCategory, CheckupCategoryConfig> = {
  ott: {
    asset: OttColorAsset,
    questions: [
      {
        title: USAGE,
        hint: '에피소드, 영화 모두 1편으로 세어 주세요',
        options: ['안 봤어요', '1~2편', '3~5편', '6~10편', '11편 이상'],
      },
      value('{name}에서 본 콘텐츠, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memo: {
      placeholder: '예: 시즌 3 공개돼서 이번 달은 유지할래요',
      chips: ['보고 싶은 작품이 있어요', '이번 달은 바빴어요', '비싸지면 해지할래요'],
    },
  },
  music: {
    asset: MusicColorAsset,
    questions: [
      { title: USAGE, hint: PER_DAY, options: DAYS },
      value('{name}으로 들은 음악, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memo: {
      placeholder: '예: 출퇴근길에 매일 들어서 계속 쓸래요',
      chips: ['매일 듣고 있어요', '다른 음악 앱이랑 겹쳐요', '가족 요금제로 바꿀래요'],
    },
  },
  shopping: {
    asset: ShoppingColorAsset,
    questions: [
      {
        title: USAGE,
        hint: '주문, 배달, 혜택 사용을 모두 1번으로 세어 주세요',
        options: ['안 썼어요', '1~2번', '3~5번', '6~9번', '10번 이상'],
      },
      value('{name} 혜택으로 아낀 돈, 구독료만큼 됐나요?'),
      PLAN,
    ],
    memo: {
      placeholder: '예: 이번 달 배달을 많이 시켜서 본전은 뽑았어요',
      chips: ['배송비로 본전 뽑았어요', '이번 달은 주문이 적었어요', '할인 끝나면 해지할래요'],
    },
  },
  education: {
    asset: EducationColorAsset,
    questions: [
      { title: USAGE, hint: PER_DAY, options: DAYS },
      value('{name}으로 한 공부, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memo: {
      placeholder: '예: 자격증 시험 끝날 때까지만 쓸래요',
      chips: ['목표 달성까지 계속할래요', '이번 달은 공부를 못 했어요', '시험 끝나면 해지할래요'],
    },
  },
  productivity: {
    asset: ProductivityColorAsset,
    questions: [
      { title: USAGE, hint: PER_DAY, options: DAYS },
      value('{name} 유료 기능, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memo: {
      placeholder: '예: 프로젝트 끝나는 다음 달까지만 쓸래요',
      chips: ['업무에 꼭 필요해요', '무료 버전으로도 충분해요', '다른 AI 툴과 겹쳐요'],
    },
  },
  entertainment: {
    asset: EntertainmentColorAsset,
    questions: [
      { title: USAGE, hint: PER_DAY, options: DAYS },
      value('{name}에서 즐긴 콘텐츠, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memo: {
      placeholder: '예: 읽고 있는 책 다 읽으면 해지할래요',
      chips: ['즐겨 보는 콘텐츠가 있어요', '이번 달은 거의 못 썼어요', '이벤트 끝나면 해지할래요'],
    },
  },
  etc: {
    asset: EtcColorAsset,
    questions: [
      { title: USAGE, hint: `${PER_DAY}. 자동으로 쓴 날도 포함해요`, options: DAYS },
      value('{name}, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memo: {
      placeholder: '예: 사진 백업용이라 계속 써야 해요',
      chips: ['자동으로 쓰고 있어요', '이번 달은 안 썼어요', '비싸지면 해지할래요'],
    },
  },
};

// 등록 화면의 카테고리 이름 → 점검 카테고리. 미지정·직접 입력은 기타
const BY_LABEL: Record<string, CheckupCategory> = {
  '영상·OTT': 'ott',
  음악: 'music',
  '쇼핑·배달 멤버십': 'shopping',
  '교육·학습': 'education',
  '생산성·AI': 'productivity',
  엔터테인먼트: 'entertainment',
};
export const toCheckupCategory = (label?: string): CheckupCategory =>
  (label && BY_LABEL[label]) || 'etc';

export interface CheckupSubscription {
  id: string;
  name: string;
  // 문항 속 이름 (Netflix → 넷플릭스). 없으면 name
  nameKo?: string;
  category?: string;
  amount: number;
  nextDate: Date;
}

// shortcut: 구독 상세 API 없이 Figma 화면과 같은 샘플, API 연동 시 구독 조회 훅으로 교체
export const CHECKUP_SAMPLE: CheckupSubscription[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    nameKo: '넷플릭스',
    category: '영상·OTT',
    amount: 13500,
    nextDate: new Date(2026, 10, 17),
  },
  { id: 'melon', name: '멜론', category: '음악', amount: 10900, nextDate: new Date(2026, 10, 5) },
  {
    id: 'coupang',
    name: '쿠팡 와우',
    category: '쇼핑·배달 멤버십',
    amount: 7890,
    nextDate: new Date(2026, 10, 22),
  },
  {
    id: 'duolingo',
    name: '듀오링고',
    category: '교육·학습',
    amount: 1100,
    nextDate: new Date(2026, 10, 2),
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: '생산성·AI',
    amount: 29000,
    nextDate: new Date(2026, 10, 12),
  },
  {
    id: 'millie',
    name: '밀리의 서재',
    category: '엔터테인먼트',
    amount: 9900,
    nextDate: new Date(2026, 9, 28),
  },
  { id: 'icloud', name: 'iCloud+', amount: 1100, nextDate: new Date(2026, 10, 2) },
];
