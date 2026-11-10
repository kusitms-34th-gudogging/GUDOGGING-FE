const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

// 완성형 한글은 초성으로 바꾸고 나머지 글자는 그대로 둠. 예: '넷플릭스' → 'ㄴㅍㄹㅅ'
const toChosung = (text: string) =>
  text.replace(/[가-힣]/g, (c) => CHOSUNG[Math.floor((c.charCodeAt(0) - 0xac00) / 588)]);

// 부분 일치, 검색어가 초성만이면 초성 일치. 영문은 대소문자 무시
export const matchesKeyword = (text: string, keyword: string) => {
  const t = text.toLowerCase();
  const k = keyword.trim().toLowerCase();
  return t.includes(k) || (/^[ㄱ-ㅎ\s]+$/.test(k) && toChosung(t).includes(k));
};
