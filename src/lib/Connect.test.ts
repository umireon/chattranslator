import Connect from './Connect.svelte'
import { render } from '@testing-library/svelte'

test('Connect snapshot', () => {
  const component = render(Connect)
  expect(component.container).toMatchSnapshot()
})
