import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'dist/**',
      'docs/**',
      'node_modules/**',
      'prisma/dev.db',
      'public/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-empty': 'warn',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-useless-assignment': 'warn',
    },
  },
]
