import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { ignores: ['docs/*', 'build/*', 'lib/*', 'dist/*', '.history/*'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // 'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'no-duplicate-imports': ['error'],
      semi: ['warn', 'always'],
    },
  },
  eslintConfigPrettier,
];
