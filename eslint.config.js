// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const jest = require('eslint-plugin-jest');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  // 코드 스타일 규칙의 원본 (AGENTS.md "코드 스타일"이 여기를 가리킴). 메시지에 대안을 적어둘 것
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../*'], message: '폴더 밖은 @/ 절대경로' },
            { group: ['@/server/*'], message: '서버 코드는 src/server, src/app/api에서만' },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression",
          message: '인라인 style 금지 → className (Reanimated는 변수로 전달)',
        },
        {
          selector:
            "CallExpression[callee.object.name='StyleSheet'][callee.property.name='create']",
          message: 'StyleSheet 금지 → className',
        },
        {
          selector:
            "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral[expressions.length>0]",
          message: '조건부 클래스는 cn',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'import/no-default-export': 'error',
    },
  },
  {
    files: ['src/server/**', 'src/app/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../*'], message: '폴더 밖은 @/ 절대경로' }] },
      ],
    },
  },
  {
    files: ['src/app/**'],
    rules: { 'import/no-default-export': 'off' },
  },
  // 가짜 테스트 금지 (unit-test.md 팀 규칙 중 기계로 잡히는 것)
  {
    files: ['**/__tests__/**'],
    plugins: { jest },
    rules: {
      'jest/no-focused-tests': 'error',
      'jest/no-disabled-tests': 'error',
      'jest/expect-expect': 'error',
      'jest/no-restricted-matchers': [
        'error',
        {
          toMatchSnapshot: '스냅샷 금지 → 사용자가 보는 결과(문구·이동·호출)를 검증',
          toMatchInlineSnapshot: '스냅샷 금지 → 사용자가 보는 결과(문구·이동·호출)를 검증',
        },
      ],
    },
  },
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
