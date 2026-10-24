// Figma(Tokens Studio) → tokens/default-token.json → (Style Dictionary) → tokens/tailwind-token.json
// default-token.json 은 Tokens Studio GitHub Sync 가 관리하는 원본이므로 읽기만 한다.
import StyleDictionary from 'style-dictionary';

// radius 라벨 S/L 은 sm/lg 로 등록
const RADIUS_RENAME = { S: 'sm', L: 'lg', s: 'sm', l: 'lg' };
// rounded-l 처럼 Tailwind 방향 유틸과 겹치는 키 금지
const RADIUS_RESERVED = [
  't',
  'r',
  'b',
  'l',
  's',
  'e',
  'tl',
  'tr',
  'br',
  'bl',
  'ss',
  'se',
  'es',
  'ee',
];

// Tokens Studio 토큰 경로 → tailwind-token.json 경로 (= tailwind.config.js theme.extend 키)
// - prefix: 하위 키 앞에 붙임 (primary spacing 은 Tailwind 기본 4px 단위 스케일과 겹치지 않도록 s 접두사 → gap-s64)
// - rename: 하위 키 이름 변경
// - flatten: 하위 경로를 '-' 로 이어 소문자 한 단계 키로 (Display.Bold → display-bold)
//   Tailwind 는 colors 외 테마 키의 중첩 객체를 펼치지 않으므로 중첩 토큰은 flatten 필요
// 새 카테고리를 노출하려면 여기에 추가 (tailwind-merge 도입 시 extendTailwindMerge 도 함께 갱신)
const MAPPINGS = [
  ['primary.spacing', 'spacing', { prefix: 's' }],
  ['semantic.spacing', 'spacing'],
  ['primary.radius', 'borderRadius', { rename: RADIUS_RENAME }],
  ['semantic.radius', 'borderRadius'],
  ['primary.font.size', 'fontSize'],
  ['styles.typography', 'fontSize', { flatten: true }],
  ['primary.font.family', 'fontFamily.sans'],
  ['primary.font.weight', 'fontWeight'],
  ['primary.color', 'colors'],
  ['semantic.color', 'colors'],
  ['semantic.size', 'size', { flatten: true }],
  ['semantic.border', 'borderWidth'],
  ['semantic.opacity', 'opacity'],
  ['styles.shadow', 'boxShadow', { flatten: true }],
];

const OUTPUT_KEYS = [...new Set(MAPPINGS.map(([, to]) => to.split('.')[0]))];

const isToken = (node) => node && typeof node === 'object' && '$value' in node;

const getAt = (obj, path) => path.reduce((o, k) => o?.[k], obj);

const setAt = (obj, path, value) => {
  const parent = path.slice(0, -1).reduce((o, k) => (o[k] ??= {}), obj);
  const key = path.at(-1);
  if (key in parent) throw new Error(`[tokens] '${path.join('.')}' 키가 중복됩니다.`);
  parent[key] = value;
};

const deleteAt = (obj, path) => {
  const parent = getAt(obj, path.slice(0, -1));
  if (parent) delete parent[path.at(-1)];
};

const leaves = (node, keys = []) =>
  isToken(node)
    ? [[keys, node]]
    : Object.entries(node).flatMap(([k, v]) => leaves(v, [...keys, k]));

// [기존 경로, 새 경로, 노드] 목록
const relocations = (subtree, from, to, { prefix = '', rename = {}, flatten = false } = {}) => {
  if (isToken(subtree)) return [[from, to, subtree]];
  if (flatten) {
    return leaves(subtree).map(([keys, token]) => [
      `${from}.${keys.join('.')}`,
      `${to}.${keys.join('-').toLowerCase()}`,
      token,
    ]);
  }
  return Object.entries(subtree).map(([key, node]) => [
    `${from}.${key}`,
    `${to}.${prefix}${rename[key] ?? key}`,
    node,
  ]);
};

// '{primary.color.gray.900}' → '{colors.gray.900}'
const rewriteRefs = (value, refMap) => {
  if (typeof value === 'string') {
    return value.replace(/\{([^}]+)\}/g, (match, ref) => {
      const from = refMap.find(([prefix]) => ref === prefix || ref.startsWith(`${prefix}.`));
      return from ? `{${from[1]}${ref.slice(from[0].length)}}` : match;
    });
  }
  if (Array.isArray(value)) return value.map((v) => rewriteRefs(v, refMap));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteRefs(v, refMap)]));
  }
  return value;
};

StyleDictionary.registerPreprocessor({
  name: 'tokens-studio/tailwind-theme',
  preprocessor: (dictionary) => {
    // 1) Tokens Studio 세트 unwrap: { primary: { primary: {...} } } → { primary: {...} }
    const order = dictionary.$metadata?.tokenSetOrder ?? Object.keys(dictionary);
    const tree = {};
    for (const set of order) {
      if (set.startsWith('$') || !dictionary[set]) continue;
      for (const [key, node] of Object.entries(dictionary[set])) setAt(tree, [key], node);
    }

    // 2) Tailwind 키로 이동
    const refMap = [];
    for (const [from, to, options] of MAPPINGS) {
      const fromPath = from.split('.');
      const subtree = getAt(tree, fromPath);
      if (!subtree) continue;
      for (const [oldPath, newPath, node] of relocations(subtree, from, to, options)) {
        setAt(tree, newPath.split('.'), node);
        refMap.push([oldPath, newPath]);
      }
      deleteAt(tree, fromPath);
    }

    for (const key of Object.keys(tree.borderRadius ?? {})) {
      if (RADIUS_RESERVED.includes(key)) {
        throw new Error(
          `[tokens] radius 키 '${key}' 는 Tailwind 방향 유틸(rounded-${key})과 겹칩니다.`,
        );
      }
    }

    // 3) 이동한 경로를 가리키는 참조 갱신 (긴 경로 우선)
    refMap.sort(([a], [b]) => b.length - a.length);
    return rewriteRefs(tree, refMap);
  },
});

// Figma 자간(%)은 font-size 기준 → RN 은 % 를 지원하지 않으므로 px 로 변환
const toLetterSpacing = (letterSpacing, fontSize) => {
  const value = String(letterSpacing);
  if (!value.endsWith('%')) return value;
  const px = (parseFloat(fontSize) * parseFloat(value)) / 100;
  return `${Math.round(px * 100) / 100}px`;
};

// typography → Tailwind fontSize 튜플: text-display-bold 로 크기·행간·자간·굵기 적용
StyleDictionary.registerTransform({
  name: 'tailwind/typography',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'typography',
  transform: ({ $value: { fontSize, lineHeight, letterSpacing, fontWeight } }) => [
    fontSize,
    {
      lineHeight,
      letterSpacing: toLetterSpacing(letterSpacing, fontSize),
      fontWeight: String(fontWeight),
    },
  ],
});

// boxShadow → CSS box-shadow 문자열 (NativeWind 가 iOS shadow* / Android elevation 으로 변환)
StyleDictionary.registerTransform({
  name: 'tailwind/shadow',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'boxShadow',
  transform: ({ $value }) =>
    [$value]
      .flat()
      .map(({ type, offsetX, offsetY, blur, spread, color }) =>
        [type === 'innerShadow' && 'inset', offsetX, offsetY, blur, spread, color]
          .filter(Boolean)
          .join(' '),
      )
      .join(', '),
});

StyleDictionary.registerTransform({
  name: 'tailwind/font-weight',
  type: 'value',
  filter: (token) => token.$type === 'fontWeights',
  transform: (token) => String(token.$value),
});

export default {
  source: ['tokens/default-token.json'],
  preprocessors: ['tokens-studio/tailwind-theme'],
  log: { verbosity: 'verbose' },
  platforms: {
    tailwind: {
      transforms: ['tailwind/typography', 'tailwind/shadow', 'tailwind/font-weight'],
      buildPath: 'tokens/',
      files: [
        {
          destination: 'tailwind-token.json',
          format: 'json/nested',
          filter: (token) => OUTPUT_KEYS.includes(token.path[0]),
        },
      ],
    },
  },
};
