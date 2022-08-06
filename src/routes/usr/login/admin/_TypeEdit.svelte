<script lang="ts">
  import Modal from '$components/Modal.svelte';
  import { keys, toObj } from '$lib/def/Tool';
  import { loginTypeInfoField, type LoginTypeInfo } from '$lib/def/User';
  import type { login_types } from '@prisma/client';

  export let info: LoginTypeInfo | undefined = undefined;

  export let edit: login_types = {
    ...(info ? info : toObj(loginTypeInfoField, '')),
    clientSecret: '',
  };
  const reset = (force?: any) => {
    if (force !== true) show();
    else
      edit = {
        ...(info ? info : toObj(loginTypeInfoField, '')),
        clientSecret: '',
      };
  };
  reset(true);
  const fname: Record<keyof login_types, string> = {
    name: '登录器名称',
    authorizationURL: '验证地址',
    tokenURL: '令牌地址',
    resourceURL: '资源地址',
    clientID: '客户端ID',
    clientSecret: '客户端密钥',
    callbackURL: '回调地址',
    emailField: '邮箱字段',
  };
  let show: () => void;
</script>

<table class="info-table table table-striped table-hover table-condensed">
  <tbody>
    {#each keys(fname) as k}
      <tr>
        <td><small>{k}</small>&nbsp;{fname[k]}</td>
        <td><input bind:value={edit[k]} /></td>
      </tr>
    {/each}
  </tbody>
</table>
<div class="btns">
  <div class="btn-group">
    {#if info}
      <button class="btn btn-outline-danger">删除</button>
      <button class="btn btn-outline-primary" on:click={reset}>重置</button>
    {/if}
    <button class="btn btn-outline-primary">{info ? '修改' : '创建'}</button>
  </div>
</div>
<Modal title="确认重置?" bind:show confirm={() => reset(true)}>
  重置 {info?.name || edit.name} 的数据?
</Modal>

<style lang="scss">
  .btns {
    position: relative;
    width: 100%;
    text-align: center;
  }
  .info-table tr {
    font-size: 1.1rem;
    small {
      color: var(--bs-gray);
    }
    td:nth-child(1) {
      text-align: right;
      width: 20%;
    }
    td:nth-child(2) input {
      width: 100%;
    }
  }
</style>
