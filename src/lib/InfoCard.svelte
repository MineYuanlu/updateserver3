<script lang="ts">
  let className = '';
  export { className as class };

  /** 信息卡片的值, 如不指定, 则显示子元素 */
  export let value: any = undefined;
  /** 值的字体大小, 默认20px */
  export let valueSize: string = '20px';
  /** 信息卡片的注释, 以较小的字号显示在值的下方 */
  export let info: any;
  /** 信息卡片的注释第二行 */
  export let info2: any = undefined;
</script>

<div class="box-hoverShadow {className}" on:click>
  {#if value === undefined}
    <slot />
  {:else}
    <div class="LogV" style="font-size: {valueSize};">
      {value}
    </div>
  {/if}
  <div class="LogK">{info}</div>
  {#if info2}
    <div class="LogKmore">{info2}</div>
  {/if}
</div>

<style>
  .LogK {
    color: #6f7376;
    font-size: 13px;
    text-align: center;
    height: 50px;
    line-height: 50px;
    overflow: hidden;
  }
  .LogKmore {
    color: #6f7376;
    font-size: 13px;
    text-align: center;
    height: 50px;
    line-height: 13px;
    overflow: hidden;
  }
  .LogV {
    margin: 20px 8px 2px 8px;
    color: #6f7376;
    font-size: 20px;
    text-align: center;
    line-height: 40px;
    overflow: hidden;
  }
  .box-shadow {
    box-shadow: 6px 6px 10px #888888;
    transition: box-shadow 0.5s;
  }
  .box-hoverShadow:hover {
    box-shadow: 2px 2px 6px #888888;
    transition: box-shadow 0.5s;
  }
</style>
