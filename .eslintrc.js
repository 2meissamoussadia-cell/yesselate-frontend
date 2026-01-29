/** Shared ESLint config for monorepo (apps can extend) */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  ignorePatterns: ['node_modules', 'dist', '.next', 'build'],
};
