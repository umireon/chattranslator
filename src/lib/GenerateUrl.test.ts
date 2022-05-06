import GenerateUrl from './GenerateUrl.svelte'
import { render } from '@testing-library/svelte'

test('Connect snapshot', () => {
  const component = render(GenerateUrl)
  expect(component.container).toMatchSnapshot()
})
