<script lang="ts">
  import type { AppContext } from '../../common/constants'
  import type { Firestore } from 'firebase/firestore'
  import type { User } from 'firebase/auth'
  import { generateNonce } from '../service/oauth'
  import { setUserData } from '../service/users'

  export let context: AppContext
  export let db: Firestore
  export let user: User

  async function handleTwitchConnect() {
    const nonce = generateNonce()
    await setUserData(db, user, { nonce })
    const query = new URLSearchParams({
      client_id: context.twitchClientId,
      redirect_uri: `${location.origin}${location.pathname}`.replace(
        /app.html$/,
        'twitch.html'
      ),
      response_type: 'token',
      scope: 'chat:read',
      state: nonce,
    })
    location.href = `https://id.twitch.tv/oauth2/authorize?${query}`
  }
</script>

<main>
  <p>
    <button type="button" on:click={handleTwitchConnect}
      >Connect to Twitch</button
    >
  </p>
</main>
