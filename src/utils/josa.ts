// 마지막 글자 받침(종성) 번호. 한글이 아니면 0(받침 없음)으로 봄
const jong = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 ? code % 28 : 0;
};

// ponytail: 문항에 쓰는 을/를·으로/로만. 영문 서비스명은 받침 없음으로 처리
// 예: fillName('{name}을 썼나요?', '넷플릭스') → '넷플릭스를 썼나요?'
export const fillName = (template: string, name: string) => {
  const j = jong(name);
  return template
    .replace('{name}을', name + (j ? '을' : '를'))
    .replace('{name}으로', name + (j && j !== 8 ? '으로' : '로'))
    .replace('{name}', name);
};
