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
  import Container from '$lib/Container.svelte';
  import Panel from '$lib/Panel.svelte';
  import SvgIcon from '$lib/SvgIcon.svelte';
  import type { UserInfoPublic } from '$lib/def/User';
  import type { VersionInfo } from '$lib/def/Version';
  import { keys } from '$lib/def/Tool';
  import { featureNames, Finfo, transData } from './_finfo';
  import { browser } from '$app/env';
  import { blur } from 'svelte/transition';
  export let project: Project<UserInfoPublic, VersionInfo>;

  const editField: { [k in keyof typeof project]?: boolean } = {};
  const editData: { [k in keyof typeof project]?: typeof project[k] } = {};
  const edit = (f: keyof typeof project) => {
    if ((editField[f] = !editField[f])) editData[f] = project[f] as any;
  };

  const name2path = (name: string) => `./_features/${name}.svelte`;
  const features =
    browser &&
    (import.meta.glob('./_features/*.svelte') as Record<string, () => Promise<{ default: any }>>);
  let nowFeature = (featureNames && name2path(Object.keys(featureNames)[0])) || undefined;
</script>

<Container id="basic">
  <Panel title="项目信息" PanelColor="cyan">
    <h2><span style="color:lightgray">{project.type}:</span>&nbsp;{project.name}</h2>
    <table id="info" class="table table-hover">
      <tbody>
        {#each keys(project) as field}
          {@const canEdit = Finfo(field, 'canEdit', false)}
          <tr>
            <td width="20%" style="text-align:right">
              {Finfo(field, 'name', field)}
            </td>
            {#if canEdit && editField[field]}
              <td>
                {#if canEdit === 'bool'}
                  <select>
                    <option selected={!!project[field]}>{transData(field, true)}</option>
                    <option selected={!project[field]}>{transData(field, false)}</option>
                  </select>
                {:else if canEdit === 'pass'}
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
        {/each}
      </tbody>
    </table>
  </Panel>
  {#if features}
    <Panel PanelColor="red">
      <div class="sub-nav" style:--elements={Object.keys(featureNames).length}>
        {#each Object.keys(featureNames) as key}
          {@const path = name2path(key)}
          <span class:active={nowFeature === path} on:click={() => (nowFeature = path)}>
            {featureNames[key]}
          </span>
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
