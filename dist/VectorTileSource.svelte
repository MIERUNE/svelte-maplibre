<script>import { onDestroy, tick } from "svelte";
import { getId, updatedSourceContext } from "./context.js";
import { addSource, removeSource } from "./source.js";
import * as pmtiles from "pmtiles";
import maplibregl, {} from "maplibre-gl";
import flush from "just-flush";
export let id = getId("vector");
export let url = null;
export let tiles = null;
export let promoteId = null;
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
$: if ($map && $source !== id) {
  $source = id;
  addSource(
    $map,
    $source,
    flush({
      type: "vector",
      url,
      tiles,
      promoteId,
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
    }
  );
}
$: $map?.on("style.load", () => {
  sourceObj = $map?.getSource(id);
});
onDestroy(() => {
  if ($source && $map) {
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
