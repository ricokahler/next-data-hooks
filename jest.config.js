module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: [
    'node_modules',
    '<rootDir>.*/dist',
    '<rootDir>.*/examples',
    '<rootDir>.*/test-app',
  ],
};
