<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  export const load: Load = async ({ fetch }) => {
    let resp = await (await fetch('/usr/login/types')).json();
    return {
      props: {
        loginTypes: resp,
      },
    };
  };
</script>

<script lang="ts">
  import { session } from '$app/stores';

  import Container from '$lib/Container.svelte';
  import type { User } from '$lib/def/User';
  import InfoCard from '$lib/InfoCard.svelte';
  import Panel from '$lib/Panel.svelte';
  import { keys } from '$lib/def/Tool';

  const fieldNames: any = {
    id: '用户编号',
    email: '邮箱',
    name: '用户名',
    nick: '昵称',
    lvl: '用户级别',
    type: '登陆平台',
  };

  export let loginTypes: string[];

  let user: User;
  $: user = $session['user'];
</script>

<Container>
  {#if user}
    <Panel title="用户信息" PanelColor="orange" col="6">
      <table class="table table-striped table-hover table-condensed">
        <tbody>
          {#each keys(user) as field}
            <tr>
              <td class="col-lg-2 col-md-3 col-sm-4 col-xs-4" style="text-align:right;">{field}</td>
              <td class="col-lg-2 col-md-3 col-sm-4 col-xs-4">
                {#if fieldNames[field]}{fieldNames[field]}{/if}
              </td>
              <td>
                {#if user[field]}
                  {user[field]}
                {:else}
                  <span style="color:lightgray">-</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <a class="btn btn-primary" href="/usr/logout">退出登录</a>
    </Panel>
  {:else}
    <Panel title="您还未登陆" PanelColor="green">
      {#each loginTypes as type}
        <a href="/usr/login/oauth2/{type}">
          <InfoCard info={type} info2="点击登录" class="col-lg-3 col-md-4 col-sm-6 col-xs-6">
            <img
              alt="?"
              src="/img/login-logo/{type}.svg"
              style="width:50%;left:25%;top:25%;position:relative;margin-top:20px"
            />
          </InfoCard>
        </a>
      {/each}
      <hr />
      <h5>
        本平台自身不存储任何用户名密码, 所有登录均为第三方登录。登录以<b>邮箱</b>作为标识,
        区分不同用户。
        <br />
        无论以何种方式登录, 只要邮箱一致, 最终都会登录为同一个账户。
      </h5>
      <h5>
        首次登录会自动创建用户, 将会从第三方平台获取用户可能匹配的用户数据作为您的初始数据.
        <br />
        除了ID以及邮箱以外, 您可以任意修改您的数据
      </h5>
    </Panel>
  {/if}
</Container>
