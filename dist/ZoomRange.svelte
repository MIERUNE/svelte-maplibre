<script>import { onMount } from "svelte";
import { writable } from "svelte/store";
import { mapContext, setMapContext } from "./context";
export let minzoom = void 0;
export let maxzoom = void 0;
export let enforce = false;
const context = mapContext();
const map = context.map;
const originalMinZoom = context.minzoom;
const originalMaxZoom = context.maxzoom;
const minZoom = writable(minzoom ?? $originalMinZoom);
const maxZoom = writable(maxzoom ?? $originalMaxZoom);
$: minZoom.set(minzoom ?? $originalMinZoom);
$: maxZoom.set(maxzoom ?? $originalMaxZoom);
setMapContext({
  ...context,
  minzoom: minZoom,
  maxzoom: maxZoom
});
let zoom = $map?.getZoom() ?? 0;
function handleZoom() {
  zoom = $map.getZoom();
}
onMount(() => {
  $map.on("zoom", handleZoom);
  return () => {
    if ($map?.loaded()) {
      $map.off("zoom", handleZoom);
    }
  };
});
</script>

<!-- @component
Set `minzoom` and `maxzoom` for all components inside the slot. By default this only propagates the value
to the inner layers.

You can set `enforce` to `true` to tear down the slot contents when the zoom
is outside the range. This is usually bad for performance, so it is not recommended for use with map layers,
but can have other uses such as creating and removing map controls or other behaviors depending on zoom level.
-->

{#if !enforce || ($minZoom <= zoom && zoom <= $maxZoom)}
  <slot />
{/if}
