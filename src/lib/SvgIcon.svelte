<script lang="ts">
  let className = '';
  export { className as class };
  export let id: string | undefined = undefined;
  export let style: string | undefined = undefined;
  /** 图标名称*/
  export let icon: string | undefined;
  $: href = !icon || icon.startsWith('#icon-') ? icon : `#icon-${icon}`;
</script>

{#if icon}
  <svg {id} {style} class="icon {className}" aria-hidden="true" on:click>
    <use xlink:href={href} />
  </svg>
{/if}
