<script context="module" lang="ts">
  import { getProjectInfo } from '$lib/api/project';
  import type { Project } from '$lib/def/Project';

  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ params, fetch }) => {
    const { type, name } = params;
    const project = await getProjectInfo(fetch, type, name);
    if (!project) return { status: 404 };
    return { props: { project } };
  };
</script>

<script lang="ts">
  import Container from '$components/Container.svelte';
  import Panel from '$components/Panel.svelte';
  import SvgIcon from '$components/SvgIcon.svelte';
  import type { UserInfo, UserInfoPublic } from '$lib/def/User';
  import type { VersionInfo } from '$lib/def/Version';
  import { keys } from '$lib/def/Tool';
  import { featureNames, Finfo, transData } from './_finfo';
  import { browser } from '$app/env';
  import { blur } from 'svelte/transition';
  import { page, session } from '$app/stores';
  import { PageLevel } from '$lib/def/MenuList';
  export let project: Project<UserInfoPublic, VersionInfo>;
  const user: UserInfo = $session.user;

  /**是否拥有项目的权限*/
  const hasPermission =
    ($session.user as UserInfo)?.id == project.owner?.id ||
    ($session.user as UserInfo)?.lvl >= PageLevel.admin;

  /**编辑状态*/
  const editField: { [k in keyof typeof project]?: boolean } = {};
  /**编辑数据*/
  const editData: { [k in keyof typeof project]?: typeof project[k] } = {};
  /**切换编辑状态*/
  const edit = (f: keyof typeof project) => {
    if ((editField[f] = !editField[f])) editData[f] = project[f] as any;
  };

  const name2path = (name: string | undefined) => (name ? `./_features/${name}.svelte` : undefined);
  const fByHash = (hash: string) =>
    hash && featureNames[hash.substring(1)] ? hash.substring(1) : undefined;
  const features =
    browser &&
    (import.meta.glob('./_features/*.svelte') as Record<string, () => Promise<{ default: any }>>);
  let nowFeatureName =
    fByHash($page.url.hash) || (featureNames && Object.keys(featureNames)[0]) || undefined;
  $: nowFeature = name2path(nowFeatureName);
  $: if (browser) location.hash = nowFeatureName || '';
</script>

<svelte:window on:hashchange={() => (nowFeatureName = fByHash(location.hash) || nowFeatureName)} />

<Container id="basic">
  <Panel title="项目信息" PanelColor="cyan">
    <h2><span style="color:lightgray">{project.type}:</span>&nbsp;{project.name}</h2>
    <table id="info" class="table table-hover">
      <tbody>
        {#each keys(project) as field}
          {@const canEdit = hasPermission && Finfo(field, 'canEdit', false)}
          {@const vi = hasPermission || !Finfo(field, 'hideOther', false)}
          {#if vi}
            <tr>
              <td width="20%" style="text-align:right">
                {Finfo(field, 'name', field)}
              </td>
              {#if canEdit && editField[field]}
                <td>
                  <!-- {#if canEdit === 'bool'}
                    <select>
                      <option selected={!!project[field]}>{transData(field, true)}</option>
                      <option selected={!project[field]}>{transData(field, false)}</option>
                    </select>
                  {:else  -->
                  {#if canEdit === 'pass'}
                    <input type="password" />
                  {:else if canEdit === 'version'}
                    <a href="/">选择版本</a>
                  {:else if canEdit === true}
                    <input type="text" />
                  {/if}
                </td>
              {:else}
                <td class="font-bold">
                  {@html transData(field, project[field])}
                </td>
              {/if}
              <td width="10%" on:click={canEdit ? () => edit(field) : undefined}>
                {#if canEdit}
                  {#if editField[field]}
                    123
                  {:else}
                    <SvgIcon icon="edit" style="font-size:2em;" />
                  {/if}
                {/if}
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </Panel>
  {#if features}
    <Panel PanelColor="red">
      <div class="sub-nav" style:--elements={Object.keys(featureNames).length}>
        {#each Object.keys(featureNames) as key}
          {#if !featureNames[key].ownerOnly || user.id === project.owner?.id || nowFeatureName === key}
            <span class:active={nowFeatureName === key} on:click={() => (nowFeatureName = key)}>
              {featureNames[key].title}
            </span>
          {/if}
        {/each}
      </div>
      {#if browser && features && nowFeature}
        {#await features[nowFeature]() then m}
          <span in:blur>
            <svelte:component this={m.default} {project} />
          </span>
        {/await}
      {/if}
    </Panel>
  {/if}
</Container>

<style lang="scss">
  .sub-nav {
    display: table;
    position: relative;
    top: -10px;
    left: -12px;
    width: calc(100% + calc(12px * 2));
    margin-bottom: 10px;
    span {
      display: table-cell;
      width: calc(100% * calc(1 / var(--elements)));
      overflow: hidden;
      white-space: nowrap;
      border-bottom: 1px solid var(--bs-gray-500);
      padding: 5px 0;
      font-size: 1.2rem;
      text-align: center;
      &.active {
        border-bottom: none;
        background-color: var(--bs-gray-200);
      }
      &:hover {
        background-color: var(--bs-gray-300);
      }
    }
  }
</style>
