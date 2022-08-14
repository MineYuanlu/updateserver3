<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="ts">
  import CardLinkPanel from '$components/CardLinkPanel.svelte';
  import Container from '$components/Container.svelte';
  import { authors, projects, self } from '$lib/def/About';
  import Panel from '$components/Panel.svelte';
</script>

<Container id="about">
  <Panel title="项目信息" PanelColor="blue">
    <h2>项目名: UpdateServer</h2>
    <h3>
      作者:
      <ul>
        {#each authors as author}
          <li><a href={author.href}>{author.name}</a></li>
        {/each}
      </ul>
    </h3>
    <h4>
      项目地址:
      <a href={self}> UpdateServer </a>
    </h4>
  </Panel>
  <Panel title="关于" PanelColor="orange">
    <p>
      <b>Update Server 2</b> 是一个基于 Svelte & SvelteKit 开发的更新管理服务器项目. (v1版本基于NodeJs)
    </p>
    <p>
      此项目是为了帮助小型项目更好的接收项目的更新, 而无需建立独立的更新站点,
      帮助项目提醒用户更新或自动化的更新
    </p>
    <hr />
    <p>通过统一接口, 您可以轻松地推送项目更新和获取项目最新版本</p>
  </Panel>
</Container>
<hr style="opacity:0" />
<Container id="other-project">
  <h2>相关的项目:</h2>
  {#each projects as p}
    <CardLinkPanel {...p} />
  {/each}
</Container>
