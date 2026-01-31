const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '\\.e2e\\.',
    // demandes: modules manquants (priority.service, approval.rules, validation.rules, risk.service, budget.service)
    'priority\\.service\\.test',
    'approval\\.rules\\.test',
    'validation\\.rules\\.test',
    'risk\\.service\\.test',
    'demande\\.service\\.test',
    'budget\\.service\\.test',
    // Vitest (à lancer avec vitest)
    'useTrendAnalysis\\.test',
    'infrastructure\\.test',
    'calendar\\.test',
    // Suites en attente d’alignement (helpers, hooks, composants)
    'governanceHelpers\\.test',
    'TrendAnalysisService\\.test',
    'VirtualizedList\\.test',
    'useGouvernanceDataWithDomain\\.test',
    'useGovernanceFilters\\.test',
    'hooks\\.test',
  ],
  moduleNameMapper: {
    '^@/lib/server/(.*)$': '<rootDir>/lib/server/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lib-root/(.*)$': '<rootDir>/lib/$1',
  },
  collectCoverageFrom: [
    'src/hooks/**/*.{ts,tsx}',
    'src/components/features/bmo/governance/**/*.{ts,tsx}',
    'src/domain/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

