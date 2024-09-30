<script>export let icon = true;
export let center = true;
export let title = void 0;
let classNames = void 0;
export { classNames as class };
</script>

<button type="button" {title} on:click>
  <div class:maplibregl-ctrl-icon={icon} class:ctrl-btn-center={center} class={classNames}>
    <slot />
  </div>
</button>

<style>
  .ctrl-btn-center {
    display: grid !important;
    height: 100%;
    width: 100%;
    place-items: center;
  }
</style>
