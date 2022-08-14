<script lang="ts">
  import { blur } from 'svelte/transition';
  let className = '';
  export { className as class };

  /**面板颜色*/
  export let PanelColor: string | undefined = undefined;
  /**面板标题*/
  export let title: string | undefined = undefined;
  /**面板宽度*/
  export let col: number | string = 12;
</script>

<div class="col-md-{col}" in:blur>
  <div
    class="Panel {className}"
    style={PanelColor ? `border-top: 3px solid var(--bs-${PanelColor})` : ''}
  >
    {#if title}
      <div class="PanelTitle">{title}</div>
    {/if}

    <div class="PanelBody"><slot /></div>
  </div>
</div>

<style>
  .Panel {
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.13);
    margin-bottom: 16px;
    background-color: #fff;
    border: 1px solid #d1d5da;
    border-radius: 1px;
  }
  .PanelTitle {
    font-family: 'Source Sans Pro', '微软雅黑', sans-serif;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 800;
    margin: 0;
    line-height: 1;
    border-bottom: 1px solid rgb(246, 246, 246);
  }
  .PanelBody {
    padding: 10px 12px;
    font-weight: 400;
    font-size: 14px;
  }
</style>
