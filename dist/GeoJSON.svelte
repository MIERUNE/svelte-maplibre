<script>import { onDestroy } from "svelte";
import { getId, updatedSourceContext } from "./context";
import { addSource, removeSource } from "./source.js";
import flush from "just-flush";
export let id = getId("geojson");
export let data;
export let generateId = false;
export let promoteId = void 0;
export let filter = void 0;
export let lineMetrics = void 0;
export let cluster = void 0;
export let maxzoom = void 0;
export let attribution = void 0;
export let buffer = void 0;
export let tolerance = void 0;
const { map, cluster: clusterStore, self: source } = updatedSourceContext();
let sourceObj;
$: $clusterStore = cluster;
let first = true;
$: if ($map && $source !== id) {
  $source = id;
  addSource(
    $map,
    $source,
    flush({
      type: "geojson",
      data,
      filter,
      lineMetrics,
      generateId,
      promoteId,
      cluster: !!cluster,
      clusterMinPoints: cluster?.minPoints,
      clusterMaxZoom: cluster?.maxZoom,
      clusterRadius: cluster?.radius,
      clusterProperties: cluster?.properties,
      maxzoom,
      attribution,
      buffer,
      tolerance
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
    sourceObj.setData(data);
  }
}
$: $map?.on("style.load", () => {
  sourceObj = $map?.getSource(id);
});
$: sourceObj?.setClusterOptions(
  flush({
    cluster: !!cluster,
    clusterMaxZoom: cluster?.maxZoom,
    clusterRadius: cluster?.radius
  })
);
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
