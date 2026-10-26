// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

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
  // CLAUDE.md 절대 규칙
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
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
