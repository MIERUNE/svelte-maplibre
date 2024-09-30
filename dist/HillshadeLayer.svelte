<script>import { getId } from "./context";
import Layer from "./Layer.svelte";
export let id = getId("hillshade-layer");
export let source = void 0;
export let beforeId = void 0;
export let beforeLayerType = void 0;
export let paint = void 0;
export let layout = void 0;
export let minzoom = void 0;
export let maxzoom = void 0;
</script>

<Layer
  {id}
  type="hillshade"
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
