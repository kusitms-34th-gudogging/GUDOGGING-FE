// default-token.json 은 Tokens Studio GitHub Sync 원본이므로 수정하지 않는다.
import StyleDictionary from 'style-dictionary';

const RADIUS_RENAME = { S: 'sm', L: 'lg', s: 'sm', l: 'lg' };
// rounded-l 처럼 Tailwind 방향 유틸과 겹치는 키
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

// prefix 's': Tailwind 기본 spacing 스케일과 겹치지 않도록 (gap-s64)
// flatten: Tailwind 는 colors 외 중첩 키를 펼치지 않음 (Display.Bold → display-bold)
const MAPPINGS = [
  ['primary.spacing', 'spacing', { prefix: 's' }],
  ['semantic.spacing', 'spacing'],
  ['primary.layout', 'spacing'],
  ['primary.radius', 'borderRadius', { rename: RADIUS_RENAME }],
  ['semantic.radius', 'borderRadius'],
  ['primary.font.size', 'fontSize'],
  ['styles.typography', 'typography', { flatten: true }],
  ['primary.font.family', 'fontFamily.sans'],
  ['primary.font.weight', 'fontWeight'],
  ['primary.color', 'colors'],
  ['semantic.color', 'colors'],
  ['primary.size', 'size', { flatten: true }],
  ['semantic.size', 'size', { flatten: true }],
  ['primary.border', 'borderWidth'],
  ['semantic.border', 'borderWidth'],
  ['semantic.opacity', 'opacity'],
  ['styles.shadow', 'boxShadow', { flatten: true }],
  // className 으로 표현할 수 없어 tokens/index.ts 로 노출
  ['primary.motion', 'motion'],
  ['semantic.motion', 'motion'],
  ['styles.gradient', 'gradient'],
  ['styles.grid', 'grid'],
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
    // { primary: { primary: {...} } } → { primary: {...} }
    const order = dictionary.$metadata?.tokenSetOrder ?? Object.keys(dictionary);
    const tree = {};
    for (const set of order) {
      if (set.startsWith('$') || !dictionary[set]) continue;
      for (const [key, node] of Object.entries(dictionary[set])) setAt(tree, [key], node);
    }

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

    // 긴 경로부터 매칭
    refMap.sort(([a], [b]) => b.length - a.length);
    return rewriteRefs(tree, refMap);
  },
});

// RN 은 % 자간을 지원하지 않으므로 font-size 기준 px 로 변환
const toLetterSpacing = (letterSpacing, fontSize) => {
  const value = String(letterSpacing);
  if (!value.endsWith('%')) return value;
  const px = (parseFloat(fontSize) * parseFloat(value)) / 100;
  return `${Math.round(px * 100) / 100}px`;
};

// Tailwind fontSize 튜플은 fontFamily 를 받지 않으므로 스타일 객체로 출력해 플러그인에서 유틸로 등록
StyleDictionary.registerTransform({
  name: 'tailwind/typography',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'typography',
  transform: ({ $value: { fontFamily, fontSize, lineHeight, letterSpacing, fontWeight } }) => ({
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing: toLetterSpacing(letterSpacing, fontSize),
    fontWeight: String(fontWeight),
  }),
});

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

// '150ms' → 150 (Reanimated duration)
StyleDictionary.registerTransform({
  name: 'js/duration',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'duration',
  transform: (token) => parseFloat(token.$value),
});

// expo-linear-gradient 의 colors·locations props 형태
StyleDictionary.registerTransform({
  name: 'js/gradient',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'gradient',
  transform: ({ $value }) => ({
    colors: $value.map(({ color }) => color),
    locations: $value.map(({ position }) => position),
  }),
});

StyleDictionary.registerTransform({
  name: 'js/grid',
  type: 'value',
  transitive: true,
  filter: (token) => token.path[0] === 'grid' && token.$type === 'dimension',
  transform: (token) => parseFloat(token.$value),
});

export default {
  source: ['tokens/default-token.json'],
  preprocessors: ['tokens-studio/tailwind-theme'],
  log: { verbosity: 'verbose' },
  platforms: {
    tailwind: {
      transforms: [
        'tailwind/typography',
        'tailwind/shadow',
        'tailwind/font-weight',
        'js/duration',
        'js/gradient',
        'js/grid',
      ],
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
