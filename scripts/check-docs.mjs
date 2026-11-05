// AI 지침 문서(AGENTS.md · CLAUDE.md · .claude/**)가 서로 연결된 상태인지 검사
// 1) 문서에 적힌 .md 경로가 실제로 있는지  2) 규칙은 paths, docs·스킬은 다른 문서의 안내가 있는지
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = process.cwd();
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (name === '.omc' || name === 'node_modules') return [];
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });

const docs = [join(root, 'AGENTS.md'), join(root, 'CLAUDE.md'), ...walk(join(root, '.claude'))];
const rel = (p) => relative(root, p);
const errors = [];

for (const file of docs) {
  const text = readFileSync(file, 'utf8');
  // `경로.md` 표기와 [이름](경로.md) 링크, CLAUDE.md의 @import
  const refs = [
    ...[...text.matchAll(/`([^`\s]+\.md)`/g)].map((m) => m[1]),
    ...[...text.matchAll(/\]\(([^)\s]+\.md)\)/g)].map((m) => join(rel(dirname(file)), m[1])),
    ...[...text.matchAll(/^@(\S+\.md)$/gm)].map((m) => m[1]),
  ];
  for (const ref of refs) {
    if (/[*{]|:\/\//.test(ref)) continue; // 글롭·자리표시자·URL은 파일이 아님
    // 경로는 저장소 루트 기준 (파일명만 쓰면 루트 파일로 봄 → .claude 안 문서는 전체 경로로 적어야 통과)
    if (!existsSync(join(root, ref)))
      errors.push(`${rel(file)}: 없는 문서 \`${ref}\` (루트 기준 전체 경로로)`);
  }
}

// 규칙은 paths로 자동 로드, docs·스킬은 다른 문서가 경로를 적어줘야 찾아감 → 아무도 안 가리키면 고아
const texts = new Map(docs.map((p) => [rel(p), readFileSync(p, 'utf8')]));
for (const [file, text] of texts) {
  if (/^\.claude\/rules\//.test(file) && !/^---\npaths:/.test(text))
    errors.push(`${file}: frontmatter paths 없음`);
  const needsRef = /^\.claude\/docs\/.+\.md$|^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(file);
  const referenced = [...texts].some(([other, t]) => other !== file && t.includes(file));
  if (needsRef && !referenced) errors.push(`${file}: 어떤 문서도 이 경로를 안내하지 않음 (고아)`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`문서 ${docs.length}개 연결 확인`);
