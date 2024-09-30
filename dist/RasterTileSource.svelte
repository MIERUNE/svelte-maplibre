<script>import { onDestroy } from "svelte";
import { getId, updatedSourceContext } from "./context";
import { addSource, removeSource } from "./source.js";
import flush from "just-flush";
import * as pmtiles from "pmtiles";
import maplibregl, {} from "maplibre-gl";
export let id = getId("raster-source");
export let tiles = void 0;
export let tileSize = void 0;
export let url = void 0;
export let bounds = null;
export let scheme = null;
export let attribution = null;
export let minzoom = null;
export let maxzoom = null;
export let volatile = null;
if (url && url.includes("pmtiles://")) {
  if (!maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty("pmtiles")) {
    let protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
  }
}
const { map, self: source } = updatedSourceContext();
let sourceObj;
let first = true;
$: if ($map && $source !== id) {
  $source = id;
  addSource(
    $map,
    $source,
    flush({
      type: "raster",
      tiles,
      tileSize,
      url,
      bounds,
      scheme,
      attribution,
      minzoom,
      maxzoom,
      volatile
    }),
    (sourceId) => $map && sourceId === $source,
    () => {
      if (!$source) {
        return;
      }
      sourceObj = $map?.getSource($source);
      first = true;
    }
  );
  sourceObj;
}
$: if (sourceObj) {
  if (first) {
    first = false;
  } else if (tiles) {
    sourceObj.setTiles(tiles);
  } else {
    sourceObj.setUrl(url);
  }
}
$: $map?.on("style.load", () => {
  sourceObj = $map?.getSource(id);
});
onDestroy(() => {
  if ($source && sourceObj && $map) {
    removeSource(map, $source, sourceObj);
    $source = null;
    sourceObj = void 0;
  }
});
</script>

{#if $source}
  {#key $source}
    <slot />
  {/key}
{/if}
