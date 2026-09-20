import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: [
      '.agents/**',
      '.kilo/**',
      '.scripts/**',
      'dist/**',
      'e2e/**',
      'node_modules/**',
      'playwright-report/**',
      'scripts/**',
      'test-results/**',
      '*.cjs',
      '*.mjs',
      'eslint.config.mjs',
      'prettier.config.js',
      'postcss.config.js',
      'server.js',
      'supabase-extract-core.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs['recommended-latest'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
