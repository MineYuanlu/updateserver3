<script lang="ts">
  export let options: (string | { name: string; value: any })[];
  export let style: string | undefined = undefined;
  export let value: any;
</script>

<select bind:value {style}>
  {#each options as o}
    <option value={typeof o === 'string' ? o : o.value}>
      {typeof o === 'string' ? o : o.name}
    </option>
  {/each}
</select>
