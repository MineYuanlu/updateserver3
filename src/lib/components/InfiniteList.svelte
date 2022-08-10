<script lang="ts">
  import type { InfiniteListImpl } from '$def/InfiniteList';
  import { inWindow } from '$def/window';
  import { onMount } from 'svelte';

  export let data: InfiniteListImpl<any>;
  export let auto: boolean = false;
  const list = data.getList();
  const loading = data.isLoading();
  const end = data.isEnd();
  onMount(() => {
    const id = setInterval(() => {
      if (!auto || $loading || $end || !inWindow(check)) return;
      data.load();
    }, 50);
    return () => clearInterval(id);
  });
  let check: HTMLElement;
</script>

<div class="box">
  <slot data={$list} />
  {#if $loading}
    <slot name="loading" />
  {/if}
  {#if $end}
    <slot name="end" />
  {/if}
  {#if auto}
    <span class="check" bind:this={check} />
  {/if}
</div>

<style>
  .box {
    position: relative;
  }
  .check {
    display: inline-block;
    position: relative;
    width: 0;
    height: 0;
    opacity: 0;
  }
</style>
