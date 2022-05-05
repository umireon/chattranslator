<script lang="ts" context="module">
  export const defaultTargetLanguageCode = 'en'
</script>

<script lang="ts">
  export let targetLanguageCode: string
</script>

<main>
  <p>
    <label for="targetLanguage">en</label>
    <input id="targetLanguage" type="text" bind:value={targetLanguageCode} />
  </p>
</main>
