<script>import { getId } from "./context";
import Layer from "./Layer.svelte";
export let id = getId("line");
export let source = void 0;
export let sourceLayer = void 0;
export let beforeId = void 0;
export let beforeLayerType = void 0;
export let paint;
export let layout = void 0;
export let filter = void 0;
export let minzoom = void 0;
export let maxzoom = void 0;
export let hoverCursor = void 0;
export let manageHoverState = false;
export let hovered = null;
export let eventsIfTopMost = false;
export let interactive = true;
</script>

<Layer
  {id}
  type="line"
  {source}
  {sourceLayer}
  {beforeId}
  {beforeLayerType}
  {paint}
  {layout}
  {filter}
  {minzoom}
  {maxzoom}
  {hoverCursor}
  {manageHoverState}
  {eventsIfTopMost}
  {interactive}
  bind:hovered
  on:click
  on:dblclick
  on:contextmenu
  on:mouseenter
  on:mousemove
  on:mouseleave
>
  <slot />
</Layer>
