<script lang="ts">
  import type { MenuElement } from '$lib/def/MenuList';
  import SvgIcon from './SvgIcon.svelte';

  let className = '';
  export { className as class };

  export let menu: MenuElement;
  export let select: boolean = false;
</script>

<a
  href={menu.href}
  class:MeumSelect={select}
  class={className}
  style={menu.visible ? '' : 'display: none;'}
>
  <SvgIcon icon={menu.icon} style="font-size: 30px;top: 5px;position: relative;color: #ffd;" />
  <span>{menu.text}</span>
</a>

<style>
  .MeumSelect {
    background-color: #289804;
  }
  a:hover {
    text-decoration: none;
    background-color: #1f6906;
    margin-left: 8px;
    opacity: 0.9;
  }
  a {
    border-radius: 2px;
    display: block;
    width: 100%;
    height: 50px;
    color: white;
    line-height: 50px;
    text-align: left;
    padding-left: 35px;
    font-size: 20px;
    transition: background-color 0.5s, margin-left 0.3s;
    margin: 10px 0px;
  }
  a span {
    margin-right: 10px;
  }
</style>
