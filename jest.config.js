/** Jest: alleen onder `src/` testen; `.claude/` negeren (voorkomt dubbele package.json / haste-collision). */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.claude/'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/', '<rootDir>/node_modules/'],
  watchPathIgnorePatterns: ['<rootDir>/.claude/', '<rootDir>/node_modules/', '<rootDir>/dist/']
};
