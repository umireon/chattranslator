import Language from './Language.svelte'
import { render } from '@testing-library/svelte'

test('Language snapshot', () => {
  const props = {
    targetLanguageCode: 'en',
  }
  const component = render(Language, { props })
  expect(component.container).toMatchSnapshot()
})
