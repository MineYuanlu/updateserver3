<script lang="ts">
  import { page } from '$app/stores';
  import { colors } from '$lib/badge';
  import type { Project } from '$lib/def/Project';
  import { keys, makeUrl } from '$lib/def/Tool';
  import type { UserInfoPublic } from '$lib/def/User';
  import type { VersionInfo } from '$lib/def/Version';
  import Select from '$lib/Select.svelte';
  import copy from 'copy-to-clipboard';
  export let project: Project<UserInfoPublic, VersionInfo>;

  const colorsKey = keys(colors);

  const anyVersion = project.v_nor || project.v_pre;

  const updateUrl = `${$page.url.origin}/update/version/${project.type}/${project.name}`;
  const assetUrl = `${$page.url.origin}/update/assets/${project.type}/${project.name}/[id]`;

  let icoType0: string, icoType1: string;
  let icoParamDefault: Record<'name' | 'txt' | 'c_none' | 'c_pre' | 'c_nor', string> = {
    name: '{1}:{2}',
    txt: '{1}',
    c_none: 'grey',
    c_pre: 'yellow',
    c_nor: 'green',
  };
  $: {
    const def = icoParam0.txt == icoParamDefault.txt;
    icoParamDefault.txt = !icoType0 || icoType0.startsWith('v') ? '{1}' : 'Download | {1}';
    if (def) icoParam0.txt = icoParamDefault.txt;
  }
  const icoParam0: { [k in keyof typeof icoParamDefault]?: string } = { ...icoParamDefault };
  const icoParam: typeof icoParam0 = {};
  $: for (const k in icoParam0)
    icoParam[k as keyof typeof icoParam] =
      icoParam0[k as keyof typeof icoParam] == icoParamDefault[k as keyof typeof icoParam] ||
      (k.startsWith('c_') && !colors[icoParam0[k as keyof typeof icoParam] as any])
        ? undefined
        : icoParam0[k as keyof typeof icoParam];
  $: icoUrl = makeUrl(
    `${$page.url.origin}/ico/${icoType0}${icoType1}/${project.type}/${project.name}`,
    icoParam,
  );

  /**
   * 复制处理
   * @param e 点击事件
   * @param txt 复制的文字
   * @param showHtml 替换元素的html, 不指定则不替换
   */
  function copyHandle(e: MouseEvent, txt: string, showHtml = '已复制!') {
    const clazz = 'btn-outline-success';
    copy(txt);
    let target = e.target as HTMLElement;
    while (!target.classList.contains('btn')) {
      if (!(target = target.parentElement!)) return;
    }
    target.classList.add(clazz);
    const old = target.innerHTML;
    if (typeof showHtml === 'string') target.innerHTML = showHtml;
    setTimeout(() => {
      target.classList.remove(clazz);
      if (typeof showHtml === 'string') target.innerHTML = old;
    }, 2000);
  }
</script>

<h3>获取更新</h3>
<blockquote>
  获取更新信息: <a href={updateUrl} target="_blank">{updateUrl}</a><br />
  可选参数, 指定后将过滤小于等于当前版本的更新信息;
  <ul>
    <li>
      id - 当前版本的版本id{#if anyVersion}(例: {anyVersion.version_id}){/if}
    </li>
    <li>
      tag - 当前版本的版本标签{#if anyVersion}(例: {anyVersion.version}){/if}
    </li>
  </ul>
</blockquote>
<hr />

<blockquote>
  获取更新资源: <a href={assetUrl} target="_blank">{assetUrl}</a><br />
  其中 <code>[id]</code> 即为版本的<b>内部</b>id, 通过上一个接口的"<code>id</code>"字段获取<br />
  通过指定参数可以限制返回的资源列表<small>(详见协议)</small>
</blockquote>
<hr />

<h3>徽章</h3>
<blockquote>
  {$page.url.origin}/ico/<Select
    options={['v', 'version', 'd', 'download']}
    bind:value={icoType0}
  /><Select
    options={['', '-n', '-nor', '-normal', '-p', '-pre', '-prerelease']}
    bind:value={icoType1}
  />/{project.type}/{project.name}?{#each keys(icoParamDefault) as k, i}
    {#if i}&{/if}{k}={#if k.startsWith('c_')}<Select
        style="background-color:{colors[icoParam0[k] || icoParamDefault[k]]}"
        options={colorsKey}
        bind:value={icoParam0[k]}
      />{:else}<input bind:value={icoParam0[k]} />{/if}
  {/each}
  <br />
  徽章链接: <a href={icoUrl} target="_blank">{icoUrl}</a>&nbsp;
  <div class="btn-group btn-group-sm">
    <button type="button" class="btn btn-outline-primary" on:click={(e) => copyHandle(e, icoUrl)}>
      复制链接
    </button>
    <button
      type="button"
      class="btn btn-outline-primary"
      on:click={(e) =>
        copyHandle(
          e,
          `[![${project.type}/${project.name}](${icoUrl})](${$page.url.origin}${$page.url.pathname})`,
        )}
    >
      复制markdown
    </button>
    <button
      type="button"
      class="btn btn-outline-primary"
      on:click={(e) =>
        copyHandle(
          e,
          `<a href="${$page.url.origin}${$page.url.pathname}" target="_blank"><img href="${icoUrl}" alt="${project.type}/${project.name}"></a>`,
        )}
    >
      复制html
    </button>
    <button
      type="button"
      class="btn btn-outline-primary"
      on:click={(e) =>
        copyHandle(e, `[url=${$page.url.origin}${$page.url.pathname}][img]${icoUrl}[/img][/url]`)}
    >
      复制bbcode
    </button>
  </div>
  <br />
  徽章预览: <img src={icoUrl} alt="{project.type}/{project.name}" /><br />
</blockquote>
