<script lang="ts">
  import { page } from '$app/stores';
  import { actions, platfroms } from '$def/hook';
  import type { Project } from '$def/Project';
  import type { UserInfoPublic } from '$def/User';
  import type { VersionInfo } from '$def/Version';
  import Select from '$lib/Select.svelte';
  export let project: Project<UserInfoPublic, VersionInfo>;

  let platfrom: string;
  let action: string;
  $: hook = `${$page.url.origin}/hook/${platfrom}/${action}/${project.type}/${project.name}`;
</script>

<h3>选项:</h3>
<ol>
  <li>
    平台:&nbsp;&nbsp;<Select options={platfroms} bind:value={platfrom} />
  </li>
  <li>
    操作:&nbsp;&nbsp;<Select options={actions} bind:value={action} />
  </li>
</ol>
<table class="table table-hover table-bordered">
  <thead><tr><th colspan="2" style:text-align="center">推送配置</th></tr></thead>
  <tbody>
    <tr>
      <td>推送地址</td>
      <td><a href={hook} target="_blank">{hook}</a></td>
    </tr>
    <tr>
      <td>HTTP 方法</td>
      <td>POST</td>
    </tr>
    <tr>
      <td>HTTP Content Type</td>
      <td><code>application/json</code></td>
    </tr>
    <tr>
      <td>接受平台</td>
      <td>{platfrom}</td>
    </tr>
    <tr>
      <td>接受事件</td>
      <td>{action}</td>
    </tr>
  </tbody>
</table>
