/** ESLint config – TypeScript + import resolver OK */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    // Dites à eslint-plugin-import comment résoudre les .ts
    'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
    'import/resolver': {
      // **nécessite eslint-import-resolver-typescript**
      typescript: { project: './tsconfig.json', alwaysTryTypes: true },
      node: { extensions: ['.ts', '.tsx', '.d.ts', '.js'] },
    },
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // On importe sans extension en TS
    'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
  },
}
