import Logout from './Logout.svelte'
import { render } from '@testing-library/svelte'

test('Logout snapshot', () => {
  const component = render(Logout)
  expect(component.container).toMatchSnapshot()
})
