<<<<<<< HEAD
﻿// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  settings: {
    "import/resolver": {
      typescript: true,
      node: { extensions: [".ts", ".tsx", ".js"] },
    },
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off", // assoupli pour le CI
    "prefer-const": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
  },
};
=======
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
>>>>>>> origin/main
