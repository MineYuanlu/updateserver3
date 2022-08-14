<script lang="ts">
  export let id: string | undefined = undefined;
</script>

<div {id} class="row"><slot /></div>

<style>
  /**单页*/
  div {
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
    overflow: auto;
  }
</style>
