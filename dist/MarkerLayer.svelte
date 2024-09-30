<script>import { createEventDispatcher, onDestroy } from "svelte";
import { getId, mapContext } from "./context";
import { combineFilters, isClusterFilter } from "./filters";
import { geoCentroid } from "d3-geo";
import Marker from "./Marker.svelte";
import FillLayer from "./FillLayer.svelte";
import { dequal } from "dequal/lite";
const { map, source, minzoom: minZoomContext, maxzoom: maxZoomContext } = mapContext();
const dispatch = createEventDispatcher();
export let applyToClusters = void 0;
export let filter = void 0;
export let markerLngLat = geoCentroid;
export let interactive = true;
export let asButton = false;
export let draggable = false;
export let minzoom = void 0;
export let maxzoom = void 0;
export let hovered = null;
export let zIndex = void 0;
let className = void 0;
export { className as class };
$: actualMinZoom = minzoom ?? $minZoomContext;
$: actualMaxZoom = maxzoom ?? $maxZoomContext;
$: actualFilter = combineFilters("all", isClusterFilter(applyToClusters), filter);
let installedHandlers = false;
function setupHandlers() {
  if (!$map) {
    return;
  }
  installedHandlers = true;
  $map.on("zoom", handleZoom);
  $map.on("move", updateMarkers);
  $map.on("moveend", updateMarkers);
  if (!$map.loaded()) {
    updateMarkers();
  } else {
    $map.once("load", updateMarkers);
  }
}
function handleData(e) {
  if (e.sourceId === $source && e.isSourceLoaded) {
    if (installedHandlers) {
      updateMarkers();
    } else {
      setupHandlers();
    }
  }
}
onDestroy(() => {
  if (!$map) {
    return;
  }
  $map.off("zoom", handleZoom);
  $map.off("move", updateMarkers);
  $map.off("moveend", updateMarkers);
  $map.off("sourcedata", handleData);
});
$: if ($map && $source) {
  let sourceObj = $map.getSource($source);
  if (sourceObj?.loaded()) {
    setupHandlers();
  } else {
    $map.on("sourcedata", handleData);
  }
}
let features = [];
function stripAutoFeatId(f) {
  if (f.id.toString().startsWith("autocluster_")) {
    return "autocluster";
  }
  if (f.id.toString().startsWith("autofeat")) {
    return "autofeat";
  }
  return f.id;
}
function someFeaturesChanged(current, next) {
  return current.length !== next.length || next.some((nextValue, idx) => {
    const currentValue = current[idx];
    return !dequal(
      {
        ...currentValue?.toJSON(),
        id: currentValue ? stripAutoFeatId(currentValue) : void 0
      },
      {
        ...nextValue.toJSON(),
        id: stripAutoFeatId(nextValue)
      }
    );
  });
}
function updateMarkers() {
  if (!$map || !$source) {
    return;
  }
  let featureList = $map.querySourceFeatures($source, {
    filter: actualFilter
  });
  let featureMap = /* @__PURE__ */ new Map();
  for (let feature of featureList) {
    if (!feature.id) {
      if (feature.properties?.cluster_id) {
        feature.id = "autocluster_" + feature.properties.cluster_id;
      } else {
        feature.id = getId("autofeat");
      }
    }
    featureMap.set(feature.id, feature);
  }
  const sorted = [...featureMap.values()].sort(
    (a, b) => a.id.toString().localeCompare(b.id.toString())
  );
  const currentFeatures = features;
  if (!someFeaturesChanged(currentFeatures, sorted)) {
    return;
  }
  features = sorted;
}
let zoom = $map?.getZoom() ?? 0;
function handleZoom(e) {
  zoom = $map.getZoom();
  updateMarkers();
}
</script>

<!--
@component Manages a set of HTML markers for the features in a source.
  This acts similar to a Layer component, but is not actually registered with
the map as a layer. Markers for non-point features are placed at the geometry's center.
-->

<!-- Set up an invisible layer so that querySourceFeatures has something to search through. -->
<FillLayer {minzoom} {maxzoom} paint={{ 'fill-opacity': 0 }} beforeLayerType="symbol" />

{#if zoom >= actualMinZoom && zoom <= actualMaxZoom}
  {#each features as feature (feature.id)}
    {@const c = markerLngLat(feature)}
    {@const z = typeof zIndex === 'function' ? zIndex(feature) : zIndex}
    <Marker
      {asButton}
      {interactive}
      {draggable}
      class={className}
      zIndex={z}
      lngLat={c}
      on:mouseenter={() => {
        hovered = feature;
      }}
      on:mouseleave={() => {
        if (hovered?.id === feature.id) {
          hovered = null;
        }
      }}
      on:dragstart={(e) => dispatch('dragstart', { ...e.detail, source: $source, feature })}
      on:drag={(e) => dispatch('drag', { ...e.detail, source: $source, feature })}
      on:dragend={(e) => dispatch('dragend', { ...e.detail, source: $source, feature })}
      on:click={(e) => dispatch('click', { ...e.detail, source: $source, feature })}
      on:dblclick={(e) => dispatch('dblclick', { ...e.detail, source: $source, feature })}
      on:contextmenu={(e) => dispatch('contextmenu', { ...e.detail, source: $source, feature })}
    >
      <slot {feature} position={c} />
    </Marker>
  {/each}
{/if}
