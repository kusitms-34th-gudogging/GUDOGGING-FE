// 사용: node tokens/diff-tokens.mjs <base.json> <head.json> [commits.txt] > pr-body.md
import { existsSync, readFileSync } from 'node:fs';

const MAX_ROWS = 50;

const [basePath, headPath, commitsPath] = process.argv.slice(2);

const read = (path) => (path && existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {});

const flatten = (node, keys = [], out = {}) => {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const [k, v] of Object.entries(node)) flatten(v, [...keys, k], out);
  } else {
    out[keys.join('.')] = typeof node === 'string' ? node : JSON.stringify(node);
  }
  return out;
};

const base = flatten(read(basePath));
const head = flatten(read(headPath));

const rows = [];
for (const key of new Set([...Object.keys(base), ...Object.keys(head)])) {
  if (!(key in base)) rows.push(['➕ 추가', key, '', head[key]]);
  else if (!(key in head)) rows.push(['➖ 삭제', key, base[key], '']);
  else if (base[key] !== head[key]) rows.push(['✏️ 변경', key, base[key], head[key]]);
}

const count = (label) => rows.filter(([type]) => type === label).length;
const cell = (value) => (value ? `\`${value.replace(/\|/g, '\\|')}\`` : '');

const commits =
  commitsPath && existsSync(commitsPath)
    ? readFileSync(commitsPath, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

const lines = [
  '## 🎨 디자인 토큰 업데이트',
  '',
  'Figma(Tokens Studio)에서 `design-token` 브랜치로 푸시된 토큰을 Style Dictionary로 빌드한 결과입니다.',
  '',
  '### 📝 디자이너 작업 내역',
  '',
  ...(commits.length ? commits.map((message) => `- ${message}`) : ['- (커밋 없음)']),
  '',
  '### 🔍 토큰 변경',
  '',
];

if (rows.length === 0) {
  lines.push('`tokens/tailwind-token.json` 에 반영되는 변경 사항이 없습니다.');
} else {
  lines.push(
    `추가 ${count('➕ 추가')} · 변경 ${count('✏️ 변경')} · 삭제 ${count('➖ 삭제')}`,
    '',
    '| 구분 | 토큰 | 이전 | 이후 |',
    '| --- | --- | --- | --- |',
    ...rows
      .slice(0, MAX_ROWS)
      .map((row) => `| ${row[0]} | \`${row[1]}\` | ${cell(row[2])} | ${cell(row[3])} |`),
  );
  if (rows.length > MAX_ROWS) {
    lines.push('', `외 ${rows.length - MAX_ROWS}건은 Files changed 탭에서 확인하세요.`);
  }
}

lines.push('', '> 이 PR은 `.github/workflows/design-token.yml` 이 자동으로 생성·갱신합니다.');

console.log(lines.join('\n'));
