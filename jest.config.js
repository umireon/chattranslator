export default {
  moduleFileExtensions: ['js', 'svelte', 'ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.svelte$': [
      'svelte-jester',
      {
        preprocess: true,
      },
    ],
    '^.+\\.tsx?$': '@swc/jest',
  },
}
