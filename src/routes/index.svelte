<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { getAllInfo } from '$lib/api/getInfos';
  import { getProjectOverview } from '$lib/api/project';

  export const load: Load = async ({ fetch, session }) => {
    return {
      props: {
        data: await getAllInfo(fetch),
        project_overview: session['user'] ? await getProjectOverview(fetch) : null,
      },
    };
  };
</script>

<script lang="ts">
  import Container from '$lib/Container.svelte';
  import InfoCard from '$lib/InfoCard.svelte';
  import Panel from '$lib/Panel.svelte';
  import { session } from '$app/stores';
  import type { User } from '$lib/def/User';
  import type { ProjectOverview, ProjectOverviewList } from '$lib/def/Project';
  import Badge from '$lib/Badge.svelte';
  import { fade } from 'svelte/transition';

  /**基础信息的列表*/
  const basicModel: any = {
    UserProjectCount: '个人项目个数',
    ProjectsCount: '全服项目个数',
    TypesCount: '全服项目类型个数',
    VersionsCount: '全服版本个数',
    AssetsCount: '全服资源个数',
    UsersCount: '全服账户个数',
  };
  /**统计信息的列表*/
  const countModel: any = {
    UpdateCheckCount: '更新查询',
    UpdatePushCount: '更新推送',
    HttpReqCount: '处理请求',
  };
  /**统计数据*/
  export let data: any;
  /** 项目概览*/
  export let project_overview: ProjectOverviewList;
  const user: User = $session['user'];
  const projects: ProjectOverview[] = [];
  if (user) {
    Object.values(project_overview).forEach((projs) => projects.push(...projs));
  }
</script>

<Container id="welcome">
  {#if user}
    <Panel PanelColor="orange">
      <h4><b>Hi&nbsp;{user.nick || user.name},</b>&nbsp;欢迎回来!</h4>
      <div class="row" style="min-height: 13vh;">
        <div class="col-md-6" style="margin: 3px">
          <b style="color:cornflowerblue">你的一些项目</b><br />
          {#each projects as proj (proj.id)}
            <Badge ico="v" type={proj.type} name={proj.name} />
          {/each}
        </div>
      </div>
    </Panel>
  {:else}
    <Panel PanelColor="gray">
      <h4><b>Hi</b><small>&nbsp;想要做些什么?</small></h4>
      <div class="row" style="min-height: 13vh;">
        <div class="col-md-6" style="margin: 3px">
          <a class="btn btn-primary" href="/usr">登录</a>
          <a class="btn btn-info" href="/about">这是什么</a>
          <a class="btn btn-info" href="/project/random">随便看看</a>
        </div>
      </div>
    </Panel>
  {/if}
</Container>

<Container id="data-basic">
  <Panel title="基础概况" PanelColor="blue">
    <div class="row col-md-12">
      {#each Object.keys(basicModel) as key}
        <InfoCard info={basicModel[key]} value={data[key]} class="col-md-2 col-sm-4 col-xs-4" />
      {/each}
    </div>
  </Panel>
</Container>
<Container id="data-count">
  <Panel title="平台运行信息" PanelColor="gray">
    <div class="row col-md-12" in:fade>
      {#each Object.keys(countModel) as key}
        <InfoCard
          info="今日{countModel[key]}次数"
          value={data[key + 'Daily']}
          class="col-md-6 col-sm-6 col-xs-6"
        />
        <InfoCard
          info="全部{countModel[key]}次数"
          value={data[key]}
          class="col-md-6 col-sm-6 col-xs-6"
        />
      {/each}
    </div>
  </Panel>
</Container>
