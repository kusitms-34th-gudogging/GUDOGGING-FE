const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

// 완성형 한글이면 0~11171 (가=0), 아니면 -1
const syllable = (c: string) => {
  const code = c.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 ? code : -1;
};

// 검색어 한 글자가 이름 한 글자와 맞는지: 같음, 초성만 입력(ㅍ→플), 마지막 글자는 받침 전까지 입력(프→플)
const charMatches = (t: string, k: string, last: boolean) => {
  if (t === k) return true;
  const tc = syllable(t);
  if (tc < 0) return false;
  if (CHOSUNG.includes(k)) return CHOSUNG[Math.floor(tc / 588)] === k;
  const kc = syllable(k);
  return last && kc >= 0 && kc % 28 === 0 && Math.floor(kc / 28) === Math.floor(tc / 28);
};

// 한글을 치는 도중의 글자(넷ㅍ·넷프)도 '넷플'에 맞게 한 글자씩 비교
const typingIncludes = (t: string, k: string) =>
  Array.from({ length: t.length - k.length + 1 }, (_, i) => i).some((i) =>
    [...k].every((c, j) => charMatches(t[i + j], c, j === k.length - 1)),
  );

const MATCHES = [
  (t: string, k: string) => t === k,
  (t: string, k: string) => t.startsWith(k),
  (t: string, k: string) => t.includes(k),
  typingIncludes,
];

// 일치율 순위, 작을수록 위: 0 같음 → 1 앞부분 일치 → 2 포함 → 3 초성·치는 중인 글자로 일치. 안 맞으면 undefined
// 여러 이름(영문·한글) 중 가장 잘 맞는 쪽으로 매김. 영문은 대소문자 무시
export const keywordRank = (texts: string[], keyword: string) => {
  const k = keyword.trim().toLowerCase();
  const ts = texts.map((t) => t.toLowerCase());
  const rank = MATCHES.findIndex((match) => ts.some((t) => match(t, k)));
  return rank >= 0 ? rank : undefined;
};
