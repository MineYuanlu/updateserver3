<script lang="ts">
  import { page, session } from '$app/stores';
  import { LvlMenuElements, PageLevel, type MenuElements } from '$lib/def/MenuList';
  import type { UserInfo } from '$lib/def/User';
  import MenuCard from './MenuCard.svelte';

  export let background: string = '/img/SideColMenu.png';
  export let logo: string = '/img/SideLogo.png';

  const user: UserInfo = $session.user;

  const viewLvl: PageLevel = ((user || {}).lvl as PageLevel) || PageLevel.anonymous;
  const menus: MenuElements = LvlMenuElements[viewLvl];

  $: path = `/${$page.url.pathname.split('/')[1]}`;
</script>

<div id="SideMenu" style="background-image: url('{background}');">
  <div id="SideMenuLogo">
    <img src={logo} alt="Side Logo" width="160px" height="100%" style="vertical-align: middle;" />
  </div>
  <div id="SideMenuInfo">
    {$session.WEB_NAME}
    <br />
    <div>
      {#if user}
        <span class="color-green">在线: </span>
        {#if user.nick}
          {user.nick}
          {#if user.name !== user.nick}
            &nbsp;({user.name})&nbsp;
          {/if}
        {:else}
          {user.name || user.id || '???'}
        {/if}
      {:else}
        离线
      {/if}
    </div>
  </div>
  <div id="SideMenuElements">
    {#each menus as menu}
      <MenuCard {menu} select={menu.href === path} />
    {/each}
  </div>
  <div id="SideMenuFooter">
    Copyright © 2022 yuanlu.
    <br />
    All rights reserved.
  </div>
</div>

<style>
  #SideMenu {
    position: fixed;
    color: white;
    background-color: rgb(36, 35, 40);
    background-repeat: repeat;
    z-index: 102;
    width: 220px;
    top: 0px;
    bottom: 0px;
    font-size: 18px;
    box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.42), 0 4px 25px 0px rgba(0, 0, 0, 0.12),
      0 8px 10px -5px rgba(0, 0, 0, 0.2);
  }
  #SideMenuLogo {
    color: #e5e5e5;
    line-height: 50px;
    font-size: 14px;
    margin: 0;
    width: 100%;
    text-align: center;
    margin: auto;
  }
  #SideMenuInfo {
    color: rgb(189, 189, 189);
    font-size: 15px;
    padding: 12px 35px;
  }
  #SideMenuElements {
    width: 100%;
  }
  #SideMenuFooter {
    display: block;
    width: 100%;
    position: absolute;
    bottom: 10px;
    font-size: 16px;
    color: #dddddd;
    text-align: center;
  }

  @media (max-width: 800px) {
    #SideMenu {
      left: -220px;
      box-shadow: none;
    }
  }
</style>
