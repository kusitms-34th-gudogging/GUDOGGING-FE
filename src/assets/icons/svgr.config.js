// 이 폴더 SVG만 검정색을 currentColor로 변환 → className의 text-* 로 색 지정
module.exports = {
  replaceAttrValues: { '#000': 'currentColor', '#000000': 'currentColor' },
};
