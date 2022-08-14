<script lang="ts">
  import InfiniteList from '$components/InfiniteList.svelte';
  import { InfiniteListImpl } from '$def/InfiniteList';
  import type { Project } from '$def/Project';
  import type { UserInfoPublic } from '$def/User';
  import type { VersionInfo } from '$def/Version';
  import { listVersion } from '$lib/api/version';
  import { blur } from 'svelte/transition';
  export let project: Project<UserInfoPublic, VersionInfo>;
  const t = (x: any): VersionInfo => x;

  const versions = new InfiniteListImpl((cur) =>
    listVersion(fetch, project.type, project.name, cur),
  );
</script>

<InfiniteList data={versions} let:data auto>
  <table class="table table-hover table-bordered" style:text-align="center">
    <thead class="table-light">
      <tr>
        <th>版本号</th>
        <th>平台</th>
        <th>类型</th>
        <th>内部ID</th>
      </tr>
    </thead>
    <tbody>
      {#each data as ele0 (ele0.id)}
        {@const ele = t(ele0)}
        <tr in:blur class:table-warning={ele.prerelease} class:table-success={!ele.prerelease}>
          <td>{ele.version}</td>
          <td>{ele.platform}</td>
          <td>{ele.prerelease ? '预览版' : '稳定版'}</td>
          <td>{new Date(ele.time).toLocaleString()}</td>
          <td>{ele.id}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</InfiniteList>
