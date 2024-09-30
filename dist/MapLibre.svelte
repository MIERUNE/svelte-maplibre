<script>import flush from "just-flush";
import { createEventDispatcher } from "svelte";
import { createMapContext } from "./context.js";
import { getViewportHash, parseViewportHash } from "./hash.js";
import maplibre, {
} from "maplibre-gl";
import compare from "just-compare";
import "maplibre-gl/dist/maplibre-gl.css";
import NavigationControl from "./NavigationControl.svelte";
import GeolocateControl from "./GeolocateControl.svelte";
import FullscreenControl from "./FullscreenControl.svelte";
import ScaleControl from "./ScaleControl.svelte";
export let map = null;
export let mapContainer = void 0;
let classNames = void 0;
export { classNames as class };
export let style;
export let diffStyleUpdates = false;
export let center = void 0;
export let zoom = void 0;
export let pitch = 0;
export let bearing = 0;
export let bounds = void 0;
export let hash = false;
export let updateHash = (url) => {
  window.history.replaceState(window.history.state, "", url);
};
export let loaded = false;
export let minZoom = 0;
export let maxZoom = 22;
export let minPitch = 0;
export let maxPitch = 60;
export let renderWorldCopies = void 0;
export let dragPan = void 0;
export let dragRotate = void 0;
export let pitchWithRotate = void 0;
export let antialias = void 0;
export let zoomOnDoubleClick = true;
export let locale = void 0;
export let interactive = true;
export let attributionControl = true;
export let cooperativeGestures = false;
export let preserveDrawingBuffer = false;
export let maxBounds = void 0;
export let images = [];
export let standardControls = false;
export let filterLayers = void 0;
export let transformRequest = void 0;
$: standardControlsPosition = typeof standardControls === "boolean" ? void 0 : standardControls;
const dispatch = createEventDispatcher();
const { map: mapInstance, loadedImages } = createMapContext();
$: map = $mapInstance;
let loadingImages = /* @__PURE__ */ new Set();
async function loadImage(image, force = false) {
  if (!$mapInstance) {
    return;
  }
  if (!$mapInstance.loaded() && !force) {
    return;
  }
  if ("url" in image) {
    loadingImages.add(image.id);
    try {
      let imageData = await $mapInstance.loadImage(image.url);
      $mapInstance?.addImage(image.id, imageData.data, image.options);
      $loadedImages.add(image.id);
      $loadedImages = $loadedImages;
    } catch (e) {
      dispatch("error", e);
    } finally {
      loadingImages.delete(image.id);
    }
  } else {
    $mapInstance.addImage(image.id, image.data, image.options);
    $loadedImages.add(image.id);
    $loadedImages = $loadedImages;
  }
}
$: if (loaded && $mapInstance?.loaded()) {
  for (let image of images) {
    if (!$loadedImages.has(image.id) && !loadingImages.has(image.id) && !$mapInstance.hasImage(image.id)) {
      loadImage(image);
    }
  }
}
$: allImagesLoaded = images.every((image) => $loadedImages.has(image.id));
let lastStyleLayerIds = void 0;
let lastStyleSourceIds = void 0;
let layersToReAddAfterStyleChange = void 0;
let sourcesToReAddAfterStyleChange = void 0;
function createMap(element) {
  onHashChange();
  $mapInstance = new maplibre.Map(
    flush({
      container: element,
      style,
      locale,
      center,
      zoom,
      pitch,
      bearing,
      minZoom,
      maxZoom,
      minPitch,
      maxPitch,
      renderWorldCopies,
      dragPan,
      dragRotate,
      pitchWithRotate,
      antialias,
      interactive,
      preserveDrawingBuffer,
      maxBounds,
      bounds,
      attributionControl,
      transformRequest,
      cooperativeGestures
    })
  );
  $mapInstance.on("load", (e) => {
    e.target.getContainer().setAttribute("data-testid", "map");
    e.target.getCanvas().setAttribute("data-testid", "map-canvas");
    loaded = true;
    dispatch("load", $mapInstance);
  });
  $mapInstance.on("error", (e) => dispatch("error", { ...e, map: $mapInstance }));
  $mapInstance.on("movestart", (ev) => dispatch("movestart", { ...ev, map: $mapInstance }));
  $mapInstance.on("moveend", (ev) => {
    center = ev.target.getCenter();
    zoom = ev.target.getZoom();
    pitch = ev.target.getPitch();
    bearing = ev.target.getBearing();
    bounds = ev.target.getBounds();
    dispatch("moveend", { ...ev, map: $mapInstance });
    if (hash) {
      let location = new URL(
        window.location.href.replace(/(#.+)?$/, getViewportHash($mapInstance))
      );
      updateHash(location);
    }
  });
  $mapInstance.on("click", (ev) => dispatch("click", { ...ev, map: $mapInstance }));
  $mapInstance.on("dblclick", (ev) => dispatch("dblclick", { ...ev, map: $mapInstance }));
  $mapInstance.on("contextmenu", (ev) => dispatch("contextmenu", { ...ev, map: $mapInstance }));
  $mapInstance.on("zoomstart", (ev) => dispatch("zoomstart", { ...ev, map: $mapInstance }));
  $mapInstance.on("zoom", (ev) => {
    dispatch("zoom", { ...ev, map: $mapInstance });
  });
  $mapInstance.on("zoomend", (ev) => {
    dispatch("zoomend", { ...ev, map: $mapInstance });
  });
  $mapInstance.on("style.load", () => {
    if ($mapInstance) {
      const mapStyle = $mapInstance.getStyle();
      lastStyleLayerIds = mapStyle.layers.map((l) => l.id);
      lastStyleSourceIds = Object.keys(mapStyle.sources);
      if (sourcesToReAddAfterStyleChange) {
        for (const [id, source] of Object.entries(sourcesToReAddAfterStyleChange)) {
          $mapInstance.addSource(id, source);
        }
      }
      if (layersToReAddAfterStyleChange) {
        for (const layer of layersToReAddAfterStyleChange) {
          $mapInstance.addLayer(layer);
        }
      }
      for (const image of images) {
        loadImage(image, true);
      }
    }
  });
  $mapInstance.on("styledata", (ev) => {
    if ($mapInstance && filterLayers) {
      const layers = $mapInstance.getStyle().layers;
      if (layers) {
        for (let layer of layers) {
          if (!filterLayers(layer)) {
            $mapInstance.setLayoutProperty(layer.id, "visibility", "none");
          }
        }
      }
    }
    dispatch("styledata", { ...ev, map: $mapInstance });
  });
  return {
    destroy() {
      loaded = false;
      $mapInstance?.remove();
      $mapInstance = null;
    }
  };
}
let lastStyle = style;
$: if ($mapInstance && !compare(style, lastStyle)) {
  const oldMapStyle = $mapInstance.getStyle();
  if (lastStyleLayerIds) {
    layersToReAddAfterStyleChange = oldMapStyle.layers.filter(
      (l) => !lastStyleLayerIds.includes(l.id)
    );
  }
  if (lastStyleSourceIds) {
    const nonStyleSourceIds = Object.keys(oldMapStyle.sources).filter(
      (sourceId) => !lastStyleSourceIds.includes(sourceId)
    );
    sourcesToReAddAfterStyleChange = {};
    for (const id of nonStyleSourceIds) {
      sourcesToReAddAfterStyleChange[id] = oldMapStyle.sources[id];
    }
  }
  lastStyle = style;
  $mapInstance.setStyle(style, { diff: diffStyleUpdates });
  $loadedImages = /* @__PURE__ */ new Set();
  loadingImages = /* @__PURE__ */ new Set();
}
$: if ($mapInstance) {
  let options = {};
  if (center != null && !compare(center, $mapInstance?.getCenter())) {
    options.center = center;
  }
  if (zoom != null && !compare(zoom, $mapInstance?.getZoom())) {
    options.zoom = zoom;
  }
  if (bearing != null && !compare(bearing, $mapInstance?.getBearing())) {
    options.bearing = bearing;
  }
  if (pitch != null && !compare(pitch, $mapInstance?.getPitch())) {
    options.pitch = pitch;
  }
  if (Object.keys(options).length) {
    $mapInstance.easeTo(options);
  }
}
$: if (bounds && !compare(bounds, $mapInstance?.getBounds())) $mapInstance?.fitBounds(bounds);
$: zoomOnDoubleClick ? $mapInstance?.doubleClickZoom.enable() : $mapInstance?.doubleClickZoom.disable();
function onHashChange() {
  if (hash) {
    let parts = parseViewportHash(window.location.hash);
    if (parts.length >= 3) {
      zoom = parts[0];
      center = [parts[2], parts[1]];
    }
    if (parts.length == 5) {
      bearing = parts[3];
      pitch = parts[4];
    }
  }
}
</script>

<svelte:window on:hashchange={onHashChange} />

<div
  class={classNames}
  bind:this={mapContainer}
  class:expand-map={!classNames}
  use:createMap
  data-testid="map-container"
>
  {#if $mapInstance && loaded}
    {#if standardControls}
      <NavigationControl position={standardControlsPosition} />
      <GeolocateControl position={standardControlsPosition} fitBoundsOptions={{ maxZoom: 12 }} />
      <FullscreenControl position={standardControlsPosition} />
      <ScaleControl position={standardControlsPosition} />
    {/if}
    <slot map={$mapInstance} loadedImages={$loadedImages} {allImagesLoaded} />
  {/if}
</div>

<style>
  .expand-map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
