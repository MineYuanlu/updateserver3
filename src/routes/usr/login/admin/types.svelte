<script context="module" lang="ts">
  import { PageLevel } from '$lib/def/MenuList';
  import { listLoginTypes } from '$lib/api/usr/login';
  import type { UserInfo } from '$lib/def/User';
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ session, fetch }) => {
    if ((session.user as UserInfo)?.lvl >= PageLevel.admin) {
      const loginTypes = await listLoginTypes(fetch);
      return { props: { loginTypes } };
    }
    return { redirect: '/usr', status: 302 };
  };
</script>

<script lang="ts">
  import Container from '$lib/Container.svelte';
  import Panel from '$lib/Panel.svelte';
  import { session } from '$app/stores';
  import InfoCard from '$lib/InfoCard.svelte';
  import { getLoginTypeInfo } from '$lib/api/usr/login';
  import TypeEdit from './_typeEdit.svelte';

  export let loginTypes: string[];

  let nowType: string = loginTypes[0];
</script>

<Container>
  <Panel title="登录类型管理" PanelColor="blue">
    <h3>管理 <b>{$session.WEB_NAME}</b> 的登录认证平台</h3>
    {#each loginTypes as type}
      <span on:click={() => (nowType = type)}>
        <InfoCard info={type} class="col-lg-3 col-md-4 col-sm-6 col-xs-6">
          <img
            alt="?"
            src="/img/login-logo/{type}.svg"
            style="width:50%;left:25%;top:25%;position:relative;margin-top:20px"
          />
        </InfoCard>
      </span>
    {/each}
    <button class="btn btn-primary" on:click={() => (nowType = '')}>新建登录器</button>
  </Panel>
  {#if nowType}
    <Panel title="管理 {nowType}" PanelColor="blue">
      {#await getLoginTypeInfo(fetch, nowType)}
        加载中...
      {:then info}
        {#if info}
          <TypeEdit {info} />
        {:else}
          <h3>无法获取信息!</h3>
          <b>找不到名为 {nowType} 的登录类型</b>
        {/if}
      {:catch err}
        <h3>无法获取信息!</h3>
        <b><pre>{err}</pre></b>
      {/await}
    </Panel>
  {:else}
    <Panel title="新建登录器" PanelColor="yellow">
      <TypeEdit />
    </Panel>
  {/if}
</Container>
