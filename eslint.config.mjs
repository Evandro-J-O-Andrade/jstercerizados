import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

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
      'test-hero-dimensions.js',
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
    files: ['audit/**/*.{js,mjs,cjs,ts}', 'playwright.config.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
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
  {
    files: [
      'src/core/**/*.{ts,tsx}',
      'src/platform/**/*.{ts,tsx}',
      'src/contexts/**/*.{ts,tsx}',
      'src/shell/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/legacy/**'],
              message:
                'Camadas autenticadas devem depender de contratos canônicos, nunca de componentes ou registros legacy.',
            },
          ],
        },
      ],
    },
  },
];
