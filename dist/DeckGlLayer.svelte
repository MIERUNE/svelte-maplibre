<script>import { createEventDispatcher, onMount, onDestroy } from "svelte";
import {
  getId,
  mapContext,
  setMapContext,
  updatedLayerContext
} from "./context";
import { readable, writable } from "svelte/store";
export let id = getId("deckgl-layer");
export let minzoom = void 0;
export let maxzoom = void 0;
export let visible = true;
export let pickable = void 0;
export let interactive = true;
export let hovered = null;
export let type;
export let data;
const dispatch = createEventDispatcher();
const context = mapContext();
const { map, minzoom: minZoomContext, maxzoom: maxZoomContext } = context;
let deckgl;
onMount(async () => {
  deckgl = await import("@deck.gl/mapbox");
});
let layerEvent = writable(null);
let layerId = writable(id);
setMapContext({
  ...context,
  popupTarget: readable(null),
  layer: layerId,
  layerEvent
});
$: $layerId = id;
$: actualMinZoom = minzoom ?? $minZoomContext;
$: actualMaxZoom = maxzoom ?? $maxZoomContext;
let zoom = $map?.getZoom() ?? 1;
$: visibility = visible && zoom >= actualMinZoom && zoom <= actualMaxZoom;
$: options = {
  ...$$restProps,
  visible: visibility,
  data,
  pickable: pickable ?? interactive,
  onClick: handleClick,
  onHover: handleHover
};
function handleZoom() {
  if ($map) {
    zoom = $map.getZoom();
  }
}
function handleClick(e) {
  if (!interactive) {
    return;
  }
  dispatch("click", e);
  $layerEvent = {
    ...e,
    layerType: "deckgl",
    type: "click"
  };
}
function handleHover(e) {
  if (!interactive) {
    return;
  }
  const type2 = e.index !== -1 ? "mousemove" : "mouseleave";
  hovered = e.object ?? null;
  dispatch(type2, e);
  $layerEvent = {
    ...e,
    layerType: "deckgl",
    type: type2
  };
}
let layer;
$: if ($map && deckgl && !layer) {
  $map.on("zoom", handleZoom);
  $map.on("zoomend", handleZoom);
  handleZoom();
  layer = new deckgl.MapboxLayer({
    id,
    type,
    ...options
  });
  $map.addLayer(layer);
}
$: layer?.setProps(options);
onDestroy(() => {
  if ($map?.loaded() && layer) {
    $map.removeLayer(id);
    $map.off("zoom", handleZoom);
    $map.off("zoomend", handleZoom);
  }
});
</script>

{#if layer}
  <slot />
{/if}
