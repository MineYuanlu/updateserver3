<script lang="ts">
  import { session } from '$app/stores';

  import InfiniteList from '$components/InfiniteList.svelte';
  import Modal from '$components/Modal.svelte';
  import { InfiniteListImpl } from '$def/InfiniteList';
  import { PageLevel } from '$def/MenuList';
  import type { Project } from '$def/Project';
  import type { UserInfo, UserInfoPublic } from '$def/User';
  import type { VersionDetail, VersionInfo } from '$def/Version';
  import { listVersion, useVersion } from '$lib/api/version';
  import { blur } from 'svelte/transition';
  import { transData } from '../_finfo';
  export let project: Project<UserInfoPublic, VersionInfo>;
  const t = (x: any): VersionDetail => x;
  $: editable =
    ($session.user as UserInfo).id === project.owner?.id ||
    ($session.user as UserInfo).lvl >= PageLevel.admin;

  const versions = new InfiniteListImpl((cur) =>
    listVersion(fetch, project.type, project.name, cur),
  );
  /**判断给定的版本信息是否是当前正在使用的版本*/
  const isNowVersion = (v: VersionDetail) => project[v.prerelease ? 'v_pre' : 'v_nor']?.id == v.id;

  //版本详细信息
  /**显示提示框*/
  let showMoal: () => void;
  /**选中的版本*/
  let selectVersion: VersionInfo;
  /**显示切换版本的提示框*/
  let showVersion = (v: VersionDetail) => {
    if (!editable || !v?.id || isNowVersion(v)) return;
    selectVersion = v;
    showMoal();
  };
</script>

<Modal
  centered
  title={selectVersion?.version}
  bind:show={showMoal}
  confirm={async () => {
    const v = selectVersion;
    if (!v) return;
    const id = v.id;
    await useVersion(fetch, project.type, project.name, id);
    location.reload();
  }}
>
  {#if selectVersion}
    确定要使用
    {#if selectVersion.prerelease}
      "{transData('v_pre', selectVersion)}"
    {:else}
      "{transData('v_nor', selectVersion)}"
    {/if}
    替换当前的
    {#if selectVersion.prerelease}
      预览版 "{transData('v_pre', project.v_pre)}"
    {:else}
      稳定版 "{transData('v_nor', project.v_nor)}"
    {/if}
    吗?
  {/if}
</Modal>
<InfiniteList data={versions} let:data auto>
  <table class="table table-hover table-bordered" style:text-align="center">
    <thead class="table-light">
      <tr>
        <th>版本号</th>
        <th>平台</th>
        <th>类型</th>
        <th>推送时间</th>
        <th>下载量</th>
        <th>内部ID</th>
      </tr>
    </thead>
    <tbody>
      {#each data as ele0 (ele0.id)}
        {@const ele = t(ele0)}
        {@const now = isNowVersion(ele)}
        <tr
          class="version-line"
          class:selectable={!now && editable}
          in:blur
          class:table-warning={ele.prerelease}
          class:table-success={!ele.prerelease}
          on:click={() => showVersion(ele)}
        >
          <td>
            {ele.version}
            {#if now}
              <span class="badge {ele.prerelease ? 'bg-warning text-dark' : 'bg-primary'}">
                当前版本
              </span>
            {/if}
          </td>
          <td>{ele.platform}</td>
          <td>{ele.prerelease ? '预览版' : '稳定版'}</td>
          <td>{new Date(ele.time).toLocaleString()}</td>
          <td>{ele.downloadCount}</td>
          <td>{ele.id}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</InfiniteList>

<style lang="scss">
  .version-line {
    &.selectable {
      cursor: pointer;
    }
    td {
      position: relative;
    }
    .badge {
      position: absolute;
      left: 3%;
    }
  }
</style>
