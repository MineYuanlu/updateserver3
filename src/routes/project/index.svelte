<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { getProjInfo } from '$lib/api/getInfos';
  import { fade } from 'svelte/transition';

  export const load: Load = async ({ fetch }) => {
    return {
      props: {
        data: await getProjInfo(fetch),
      },
    };
  };
</script>

<script lang="ts">
  import Container from '$lib/Container.svelte';
  import InfoCard from '$lib/InfoCard.svelte';
  import Panel from '$lib/Panel.svelte';
  import type { ProjectInfoList } from '$lib/def/Project';
  import { browser } from '$app/env';
  import { getProjectList as getProjectList0 } from '$lib/api/project';
  import type { VersionInfo } from '$lib/def/Version';
  import { session } from '$app/stores';
  import type { UserInfo } from '$lib/def/User';

  const login = !!($session.user as UserInfo)?.id;
  type showType = 'me' | 'all';
  type ProjectInfo = ProjectInfoList['list'][number];
  /**基础信息的列表*/
  const basicModel: { [key: string]: { txt: string; type: showType } } = {
    UserProjectCount: { txt: '个人项目', type: 'me' },
    ProjectsCount: { txt: '全服项目', type: 'all' },
  };
  /**信息数据*/
  export let data: any;
  /**显示类型*/
  let type: showType = login ? 'me' : 'all';
  /**是否正在显示全部列表*/
  $: showAll = type === 'all';
  /**发生的错误*/
  const err = { me: 0, all: 0 };
  /**项目信息*/
  const projects: { [key: string]: ProjectInfo[] } = { me: [], all: [] };
  /**项目列表状态*/
  const projectListStat: {
    [key: string]: { end: boolean; index: number | undefined; lock?: boolean };
  } = {
    me: { end: !login, index: undefined, lock: undefined },
    all: { end: false, index: undefined, lock: undefined },
  };

  /**跳转至项目*/
  const goProject = (p: ProjectInfo) => {
    window.location.href = `/project/info/${p.type}/${p.name}`;
  };
  /**
   * 加载项目列表
   * @return 失败提示
   */
  const getProjectList = async (): Promise<string | null> => {
    const stat = projectListStat[type];
    if (stat.lock) return '运行中';
    stat.lock = true;

    try {
      if (stat.end) return '已全部加载';
      let ps = await getProjectList0(fetch, type, stat.index);
      projects[type].push(...ps.list);
      projects[type] = projects[type];
      stat.index = ps.nextIndex;
      stat.end ||= ps.end;
    } catch (err) {
      console.log(err);
      return `错误: ${err}`;
    }
    stat.lock = false;
    return null;
  };
  /**切换显示类型*/
  const switchType = (t: showType) => {
    type = t;
    const stat = projectListStat[type];
    if (!stat.end && !stat.index) getProjectList();
  };
  /**获取版本字符串*/
  const getVersion = (ver: null | number | VersionInfo): string => {
    if (typeof ver === 'number') return ver.toString();
    return (ver?.version || '-').toString();
  };

  if (browser) getProjectList();
</script>

{#if !data}
  <Container id="project-basic">
    <Panel title="基础概况" PanelColor="blue">加载中...</Panel>
  </Container>
  <Container id="project-basic">
    <Panel title="项目列表" PanelColor="gray">加载中...</Panel>
  </Container>
{:else}
  <Container id="project-basic">
    <Panel title="基础概况" PanelColor="blue">
      <div class="row col-md-12">
        {#each Object.keys(basicModel) as key}
          <InfoCard
            info="点击显示{basicModel[key].txt}"
            value="{basicModel[key].txt}: {data[key]} 个"
            class="col-md-6 col-sm-6 {type === basicModel[key].type ? 'box-shadow' : ''}"
            on:click={() => switchType(basicModel[key].type)}
          />
        {/each}
      </div>
    </Panel>
  </Container>
  <Container id="project-list">
    <Panel title={showAll ? '全部项目列表' : '个人项目列表'}>
      {#if showAll || login}
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              {#if showAll}
                <th>作者</th>
              {/if}
              <th>最新稳定版</th>
              <th>最新预览版</th>
            </tr>
          </thead>
          <tbody>
            {#if err[type]}
              <tr style="text-align:center;">
                <td colspan="5">{err[type]}</td>
              </tr>
            {:else if projects[type].length}
              {#each projects[type] as p (p.id)}
                <tr in:fade on:click={() => goProject(p)}>
                  <td>{p.name}</td>
                  <td>{p.type}</td>
                  {#if showAll}
                    <td>{p.owner}</td>
                  {/if}
                  <td>{getVersion(p.v_nor)}</td>
                  <td>{getVersion(p.v_pre)}</td>
                </tr>
              {/each}
              {#if !projectListStat[type].end}
                <td colspan="5" style="text-align:center">
                  <button class="btn btn-lg btn-block" style="width:100%">点击加载</button>
                </td>
              {/if}
            {:else}
              <tr class="info" style="text-align:center;">
                <td colspan="5" style="text-align:center">
                  {#if projectListStat[type].end}暂无项目{:else}加载中...{/if}
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      {:else}
        请先<a href="/usr">登录</a>!
      {/if}
    </Panel>
  </Container>
{/if}
