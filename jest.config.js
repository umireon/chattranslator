/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  moduleFileExtensions: ['js', 'svelte', 'ts'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.svelte$': [
      'svelte-jester',
      {
        preprocess: true,
      },
    ],
  },
}
