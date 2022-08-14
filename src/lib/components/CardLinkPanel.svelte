<script lang="ts">
  export let href: string;
  export let name: string;
  export let description: string = '';
  export let target: string = '_blank';
</script>

<div class="col-lg-6 col-xs-12">
  <a class="CardPanel" {href} {target}>
    <div class="PanelTitle">{name}</div>
    <div class="PanelBody">{description}</div>
    <div class="PanelIcon" />
  </a>
</div>

<style>
  a.CardPanel:hover {
    color: #23527c;
  }
  a.CardPanel {
    -webkit-box-shadow: 2px 4px 14px 4px rgba(112, 114, 124, 0.2);
    box-shadow: 2px 4px 14px 4px rgba(112, 114, 124, 0.2);
    margin-bottom: 16px;
    background-color: #fff;
    border: 1px solid #d1d5da;
    border-radius: 10px;
    display: block;
    height: 90px;
    color: #000;
    position: relative;
  }
  .PanelTitle {
    margin: 0;
    font-size: 23px;
    border-bottom: none;
    line-height: 15px;
    padding-top: 20px;
    font-weight: bold;
    font-family: 'Source Sans Pro', '微软雅黑', sans-serif;
    padding: 20px 20px 12px;
  }
  .PanelBody {
    font-weight: bold;
    font-size: 12px;
    display: inline-block;
    padding: 0 20px 12px;
  }
  .PanelIcon {
    float: right;
    transform: rotate(45deg);
    width: 12px;
    height: 12px;
    border: 2px solid rgba(148, 156, 177, 0.4);
    border-width: 2px 2px 0 0;
    position: absolute;
    display: block;
    right: 13px;
    /**(90-12)/2*/
    top: 39px;
  }
</style>
