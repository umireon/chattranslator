<script lang="ts" context="module">
  export const defaultTargetLanguageCode = "en";
</script>

<script lang="ts">
  export let targetLanguageCode: string;
</script>

<main>
  <p>
    <label for="targetLanguage">Target Language</label>
    <input
      id="targetLanguage"
      list="targetLanguageList"
      type="text"
      bind:value={targetLanguageCode}
    />
    <datalist id="targetLanguageList">
      <option value="de" />
      <option value="en" />
      <option value="es" />
      <option value="fr" />
      <option value="it" />
      <option value="ja" />
      <option value="ko" />
      <option value="pl" />
      <option value="pt" />
      <option value="ru" />
      <option value="th" />
      <option value="tr" />
      <option value="zh" />
    </datalist>
  </p>
</main>
