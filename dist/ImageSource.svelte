<script>import { onDestroy, tick } from "svelte";
import { getId, updatedSourceContext } from "./context.js";
import { addSource, removeSource } from "./source.js";
import flush from "just-flush";
export let id = getId("image");
export let url;
export let coordinates;
const { map, self: source } = updatedSourceContext();
let sourceObj;
let first = true;
$: if ($map && $source !== id) {
  $source = id;
  addSource(
    $map,
    $source,
    flush({
      type: "image",
      url,
      coordinates
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
}
$: if (sourceObj) {
  if (first) {
    first = false;
  } else {
    sourceObj.setCoordinates(coordinates);
  }
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
