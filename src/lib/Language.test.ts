import Language from './Language.svelte'
import { render } from '@testing-library/svelte'

test('Language snapshot', () => {
  const component = render(Language)
  expect(component.container).toMatchSnapshot()
})
