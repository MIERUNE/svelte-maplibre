<script>import { getId, updatedLayerContext } from "./context.js";
import { diffApplier } from "./compare.js";
import { combineFilters, isClusterFilter } from "./filters.js";
import flush from "just-flush";
import { onDestroy, createEventDispatcher } from "svelte";
export let id = getId("layer");
export let source = void 0;
export let sourceLayer = void 0;
export let beforeId = void 0;
export let beforeLayerType = void 0;
export let type;
export let paint = void 0;
export let layout = void 0;
export let filter = void 0;
export let applyToClusters = void 0;
export let minzoom = void 0;
export let maxzoom = void 0;
export let manageHoverState = false;
export let hovered = null;
export let interactive = true;
export let hoverCursor = void 0;
export let eventsIfTopMost = false;
const dispatch = createEventDispatcher();
$: clusterFilter = isClusterFilter(applyToClusters);
$: layerFilter = combineFilters("all", clusterFilter, filter);
const {
  map,
  source: sourceName,
  self: layer,
  minzoom: minZoomContext,
  maxzoom: maxZoomContext,
  eventTopMost,
  layerInfo
} = updatedLayerContext();
$: actualMinZoom = minzoom ?? $minZoomContext;
$: actualMaxZoom = maxzoom ?? $maxZoomContext;
$: if ($layer) {
  layerInfo.set($layer, {
    interactive
  });
}
onDestroy(() => {
  if ($layer && $map) {
    layerInfo.delete($layer);
    $map?.removeLayer($layer);
  }
});
$: actualSource = source || $sourceName;
let hoverFeatureId = void 0;
function handleClick(e) {
  if (!interactive || !$layer || !$map) {
    return;
  }
  if (eventsIfTopMost && eventTopMost(e) !== $layer) {
    return;
  }
  let features = e.features ?? [];
  let clusterId = features[0]?.properties?.cluster_id;
  let eventData = {
    event: e,
    map: $map,
    clusterId,
    layer: $layer,
    source: actualSource,
    features
  };
  dispatch(e.type, eventData);
}
function handleMouseEnter(e) {
  if (!interactive || !$layer || !$map) {
    return;
  }
  if (eventsIfTopMost && eventTopMost(e) !== $layer) {
    return;
  }
  if (hoverCursor) {
    $map.getCanvas().style.cursor = hoverCursor;
  }
  let features = e.features ?? [];
  hovered = features[0] ?? null;
  let clusterId = features[0]?.properties?.cluster_id;
  let data = {
    event: e,
    map: $map,
    clusterId,
    layer: $layer,
    source: actualSource,
    features
  };
  dispatch("mouseenter", data);
}
function handleMouseMove(e) {
  if (!interactive || !$map) {
    return;
  }
  if (eventsIfTopMost && eventTopMost(e) !== $layer) {
    hovered = null;
    if (manageHoverState && hoverFeatureId !== void 0) {
      $map?.setFeatureState(
        { source: actualSource, sourceLayer, id: hoverFeatureId },
        { hover: false }
      );
      hoverFeatureId = void 0;
    }
    return;
  }
  $map.getCanvas().style.cursor = hoverCursor;
  let features = e.features ?? [];
  let clusterId = features[0]?.properties?.cluster_id;
  let featureId = features[0]?.id;
  if (featureId !== hoverFeatureId) {
    if (manageHoverState) {
      if (hoverFeatureId !== void 0) {
        $map?.setFeatureState(
          { source: actualSource, id: hoverFeatureId, sourceLayer },
          { hover: false }
        );
      }
      $map?.setFeatureState(
        { source: actualSource, id: featureId, sourceLayer },
        { hover: true }
      );
    }
    hoverFeatureId = featureId;
    hovered = features[0] ?? null;
  }
  dispatch("mousemove", {
    event: e,
    map: $map,
    clusterId,
    layer: $layer,
    source: actualSource,
    features
  });
}
function handleMouseLeave(e) {
  if (!interactive || !$layer || !$map) {
    return;
  }
  if (hoverCursor) {
    $map.getCanvas().style.cursor = "";
  }
  hovered = null;
  if (manageHoverState && hoverFeatureId !== void 0) {
    const featureSelector = { source: actualSource, id: hoverFeatureId, sourceLayer };
    $map?.setFeatureState(featureSelector, { hover: false });
    hoverFeatureId = void 0;
  }
  dispatch("mouseleave", {
    map: $map,
    layer: $layer,
    source: actualSource
  });
}
let first = true;
$: if ($map && $layer !== id && actualSource) {
  if ($layer) {
    unsubEvents($layer);
    layerInfo.delete($layer);
  }
  let actualBeforeId = beforeId;
  if (!beforeId && beforeLayerType) {
    let layers = $map.getStyle().layers;
    let layerFunc = typeof beforeLayerType === "function" ? beforeLayerType : (l) => l.type === beforeLayerType;
    let beforeLayer = layers?.find(layerFunc);
    if (beforeLayer) {
      actualBeforeId = beforeLayer.id;
    }
  }
  $layer = id;
  $map.addLayer(
    flush({
      id: $layer,
      type,
      source: actualSource,
      "source-layer": sourceLayer,
      filter: layerFilter,
      paint,
      layout,
      minzoom: actualMinZoom,
      maxzoom: actualMaxZoom
    }),
    actualBeforeId
  );
  first = true;
  $map.on("click", $layer, handleClick);
  $map.on("dblclick", $layer, handleClick);
  $map.on("contextmenu", $layer, handleClick);
  $map.on("mouseenter", $layer, handleMouseEnter);
  $map.on("mousemove", $layer, handleMouseMove);
  $map.on("mouseleave", $layer, handleMouseLeave);
}
function unsubEvents(layerName) {
  if (!$map) {
    return;
  }
  $map.off("click", layerName, handleClick);
  $map.off("dblclick", layerName, handleClick);
  $map.off("contextmenu", layerName, handleClick);
  $map.off("mouseenter", layerName, handleMouseEnter);
  $map.off("mousemove", layerName, handleMouseMove);
  $map.off("mouseleave", layerName, handleMouseLeave);
}
onDestroy(() => {
  if ($map && $layer) {
    unsubEvents($layer);
  }
});
$: applyPaint = $layer ? diffApplier((key, value) => $map?.setPaintProperty($layer, key, value)) : void 0;
$: applyLayout = $layer ? diffApplier((key, value) => $map?.setLayoutProperty($layer, key, value)) : void 0;
$: if ($map) {
  if ($map.isStyleLoaded()) {
    applyPaint?.(paint);
  } else {
    $map.once("styledata", () => applyPaint?.(paint));
  }
}
$: if ($map) {
  if ($map.isStyleLoaded()) {
    applyLayout?.(layout);
  } else {
    $map.once("styledata", () => applyLayout?.(layout));
  }
}
$: if ($layer) $map?.setLayerZoomRange($layer, actualMinZoom, actualMaxZoom);
$: if ($layer) {
  if (first) {
    first = false;
  } else {
    $map?.setFilter($layer, layerFilter);
  }
}
</script>

<!--
@component
A component that handles a generic layer. This is intended for use by other type-specific
layer components, such as FillLayer, and usually you will want to use one of those in your
code instead of directly using this component.
-->

{#if $layer}
  {#key $layer}
    <slot />
  {/key}
{/if}
