export default {
  moduleFileExtensions: ['js', 'svelte', 'ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.*esm.*/.+\\.js$': '@swc/jest',
    '^.+\\.esm.*js$': '@swc/jest',
    '^.+\\.svelte$': [
      'svelte-jester',
      {
        preprocess: true,
      },
    ],
    '^.+\\.tsx?$': '@swc/jest',
  },
  transformIgnorePatterns: ["/node_modules/(?!@?firebase/)"]
}
