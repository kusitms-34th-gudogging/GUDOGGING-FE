// 카테고리별 점검 문항 (화면설계서 K-11~K-66, 메모 K-70). 서버가 카테고리에 맞춰 내려주는 데이터
// 임의: 서비스명·금액·결제일 자리 표시 형식은 명세에 없어 앱이 쓰던 형식으로 (백엔드 확인 필요)
//   {name}을·{name}으로처럼 조사는 앱이 서비스명 받침에 맞춰 바꿈
//   hint의 {amount} 월 구독료 · {year} 1년 구독료 · {next} 다음 결제(예: 11월 17일 · 13,500원)

type Category =
  | 'VIDEO_OTT'
  | 'MUSIC'
  | 'SHOPPING_DELIVERY'
  | 'EDUCATION'
  | 'PRODUCTIVITY_AI'
  | 'ENTERTAINMENT'
  | 'ETC';

const options = (texts: string[]) => texts.map((text, i) => ({ score: i + 1, text }));
const question = (type: string, label: string, hint: string, texts: string[]) => ({
  type,
  label,
  hint,
  options: options(texts),
});

const USAGE = '최근 한 달 동안 {name}을 얼마나 자주 이용했나요?';
const PER_DAY = '하루에 여러 번 써도 1일로 세어 주세요';
const DAYS = ['안 썼어요', '한 달에 1~3일', '주 1~2일', '주 3~5일', '거의 매일'];
const value = (label: string) =>
  question('SATISFACTION', label, '월 {amount} · 1년이면 {year}', [
    '많이 아까워요',
    '조금 아까워요',
    '보통이에요',
    '구독료만큼 가치 있어요',
    '구독료보다 더 가치 있어요',
  ]);
// 3/4 다음 달 계획은 카테고리 모두 같음
const PLAN = question('PLAN', '다음 달에도 {name}을 이용할 계획이 있나요?', '다음 결제 {next}', [
  '안 쓸 거예요',
  '거의 안 쓸 것 같아요',
  '아직 잘 모르겠어요',
  '아마 계속 쓸 것 같아요',
  '꼭 계속 쓸 거예요',
]);
const days = (hint = PER_DAY) => question('USAGE', USAGE, hint, DAYS);

export const CHECKUP_FORMS: Record<
  Category,
  { questions: ReturnType<typeof question>[]; memoPlaceholder: string; memoChips: string[] }
> = {
  VIDEO_OTT: {
    questions: [
      question('USAGE', USAGE, '에피소드, 영화 모두 1편으로 세어 주세요', [
        '안 봤어요',
        '1~2편',
        '3~5편',
        '6~10편',
        '11편 이상',
      ]),
      value('{name}에서 본 콘텐츠, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memoPlaceholder: '예: 시즌 3 공개돼서 이번 달은 유지할래요',
    memoChips: ['보고 싶은 작품이 있어요', '이번 달은 바빴어요', '비싸지면 해지할래요'],
  },
  MUSIC: {
    questions: [days(), value('{name}으로 들은 음악, 구독료만큼 가치 있었나요?'), PLAN],
    memoPlaceholder: '예: 출퇴근길에 매일 들어서 계속 쓸래요',
    memoChips: ['매일 듣고 있어요', '다른 음악 앱이랑 겹쳐요', '가족 요금제로 바꿀래요'],
  },
  SHOPPING_DELIVERY: {
    questions: [
      question('USAGE', USAGE, '주문, 배달, 혜택 사용을 모두 1번으로 세어 주세요', [
        '안 썼어요',
        '1~2번',
        '3~5번',
        '6~9번',
        '10번 이상',
      ]),
      value('{name} 혜택으로 아낀 돈, 구독료만큼 됐나요?'),
      PLAN,
    ],
    memoPlaceholder: '예: 이번 달 배달을 많이 시켜서 본전은 뽑았어요',
    memoChips: ['배송비로 본전 뽑았어요', '이번 달은 주문이 적었어요', '할인 끝나면 해지할래요'],
  },
  EDUCATION: {
    questions: [days(), value('{name}으로 한 공부, 구독료만큼 가치 있었나요?'), PLAN],
    memoPlaceholder: '예: 자격증 시험 끝날 때까지만 쓸래요',
    memoChips: ['목표 달성까지 계속할래요', '이번 달은 공부를 못 했어요', '시험 끝나면 해지할래요'],
  },
  PRODUCTIVITY_AI: {
    questions: [days(), value('{name} 유료 기능, 구독료만큼 가치 있었나요?'), PLAN],
    memoPlaceholder: '예: 프로젝트 끝나는 다음 달까지만 쓸래요',
    memoChips: ['업무에 꼭 필요해요', '무료 버전으로도 충분해요', '다른 AI 툴과 겹쳐요'],
  },
  ENTERTAINMENT: {
    questions: [days(), value('{name}에서 즐긴 콘텐츠, 구독료만큼 가치 있었나요?'), PLAN],
    memoPlaceholder: '예: 읽고 있는 책 다 읽으면 해지할래요',
    memoChips: [
      '즐겨 보는 콘텐츠가 있어요',
      '이번 달은 거의 못 썼어요',
      '이벤트 끝나면 해지할래요',
    ],
  },
  ETC: {
    questions: [
      days(`${PER_DAY}. 자동으로 쓴 날도 포함해요`),
      value('{name}, 구독료만큼 가치 있었나요?'),
      PLAN,
    ],
    memoPlaceholder: '예: 사진 백업용이라 계속 써야 해요',
    memoChips: ['자동으로 쓰고 있어요', '이번 달은 안 썼어요', '비싸지면 해지할래요'],
  },
};

export const checkupForm = (category: string) =>
  CHECKUP_FORMS[category as Category] ?? CHECKUP_FORMS.ETC;
