<script>import { onDestroy } from "svelte";
import { getId, updatedSourceContext } from "./context";
import { addSource, removeSource } from "./source.js";
import flush from "just-flush";
export let id = getId("raster-source");
export let tiles;
export let tileSize = void 0;
export let bounds = null;
export let attribution = null;
export let minzoom = null;
export let maxzoom = null;
export let volatile = null;
export let encoding = null;
export let redFactor = null;
export let greenFactor;
export let blueFactor;
export let baseShift;
const { map, self: source } = updatedSourceContext();
let sourceObj;
let first = true;
$: if ($map && $source !== id) {
  $source = id;
  addSource(
    $map,
    $source,
    flush({
      type: "raster-dem",
      tiles,
      tileSize,
      bounds,
      attribution,
      minzoom,
      maxzoom,
      volatile,
      encoding,
      redFactor,
      greenFactor,
      blueFactor,
      baseShift
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
  } else {
    sourceObj.setTiles(tiles);
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
