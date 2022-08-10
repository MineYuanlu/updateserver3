<script lang="ts">
  export let options: readonly (string | { name: string; value: any })[];
  export let style: string | undefined = undefined;
  export let value: any;
</script>

<select class="form-select" bind:value {style}>
  {#each options as o}
    <option value={typeof o === 'string' ? o : o.value}>
      {typeof o === 'string' ? o : o.name}
    </option>
  {/each}
</select>

<style>
  select.form-select {
    width: unset;
    display: inline-block;
  }
</style>
