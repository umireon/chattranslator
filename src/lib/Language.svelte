<script lang="ts" context="module">
  export const defaultTargetLanguageCode = 'en'
</script>

<script lang="ts">
  export let targetLanguageCode: string
</script>

<main>
  <p>
    <label for="targetLanguage">Target Language</label>
    <input id="targetLanguage" list="targetLanguageList" type="text" bind:value={targetLanguageCode} />
    <datalist id="targetLanguageList">
      <option value="de"></option>
      <option value="en"></option>
      <option value="es"></option>
      <option value="fr"></option>
      <option value="it"></option>
      <option value="ja"></option>
      <option value="ko"></option>
      <option value="pl"></option>
      <option value="pt"></option>
      <option value="ru"></option>
      <option value="th"></option>
      <option value="tr"></option>
      <option value="zh"></option>
    </datalist>
  </p>
</main>
