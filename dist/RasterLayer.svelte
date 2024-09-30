<script>import { getId } from "./context";
import Layer from "./Layer.svelte";
export let id = getId("raster-layer");
export let source = void 0;
export let beforeId = void 0;
export let beforeLayerType = void 0;
export let paint;
export let layout = void 0;
export let minzoom = void 0;
export let maxzoom = void 0;
</script>

<Layer
  {id}
  type="raster"
  {source}
  {beforeId}
  {beforeLayerType}
  {paint}
  {layout}
  {minzoom}
  {maxzoom}
  on:click
  on:dblclick
  on:contextmenu
  on:mouseenter
  on:mousemove
  on:mouseleave
>
  <slot />
</Layer>
