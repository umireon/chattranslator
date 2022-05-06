import Connect from './Connect.svelte'
import { render } from '@testing-library/svelte'

test('a', () => {
  const component = render(Connect)
  expect(component.container).toMatchSnapshot()
})
