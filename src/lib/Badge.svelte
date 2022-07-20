<script lang="ts">
  import { makeUrl } from './def/Tool';

  export let ico: string;
  export let type: string;
  export let name: string;
  export const query: Record<string, string> = {};

  $: src = makeUrl('/', 'ico', ico, type, name, query);
</script>

<a href="/project/info/{type}/{name}">
  <img {src} alt="{type}/{name}" />
</a>

<style>
  a {
    margin: 4px;
    display: inline-block;
  }
  img {
    width: 100%;
    height: 100%;
  }
</style>
