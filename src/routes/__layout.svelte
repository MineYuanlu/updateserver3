<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import SideMenu from '$components/SideMenu.svelte';
  import '../app.css';
</script>

<SideMenu />

<main>
  <slot />
</main>

<style>
  main {
    display: block;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    padding-top: 1rem;
    padding-left: 220px;
    max-width: 1580px;
  }
  @media (max-width: 800px) {
    main {
      padding-left: 0px;
    }
  }
</style>
