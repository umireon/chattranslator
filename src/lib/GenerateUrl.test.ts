import GenerateUrl from './GenerateUrl.svelte'
import { render } from '@testing-library/svelte'

test('GenerateUrl snapshot', () => {
  const component = render(GenerateUrl)
  expect(component.container).toMatchSnapshot()
})
