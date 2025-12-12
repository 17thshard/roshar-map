import globals from 'globals'
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.yarn/**',
      '**/coverage/**',
      'build/generated/**',
    ]
  },

  // Equivalent to `extends: ['eslint:recommended']` from .eslintrc
  js.configs.recommended,

  // Equivalent to `extends: ['plugin:vue/vue2-recommended']` from .eslintrc (Vue 2 project)
  ...vue.configs['flat/vue2-recommended'],

  // Browser app code (Vue SFCs + JS modules)
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      },
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: { vue },
    rules: {
      // keep legacy behavior
      'no-param-reassign': 'off',
      // keep historical lenience for existing code (warn instead of error)
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Legacy Vue codebase compatibility (avoid huge rule churn)
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/no-mutating-props': 'off',
      'vue/no-v-html': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/this-in-template': 'off'
    }
  },
  // Node scripts / tooling
  {
    files: ['bin/**/*.js', 'build/**/*.js', '*.config.cjs', '*.config.js', '*.config.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
  ,
  // ESM config files
  {
    files: ['*.mjs', 'build/**/*.mjs', 'vite.config.mjs', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
]


