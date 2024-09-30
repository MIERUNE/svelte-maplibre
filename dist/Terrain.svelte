<script>import { mapContext } from "./context";
import maplibregl from "maplibre-gl";
import { onDestroy } from "svelte";
const { map } = mapContext();
export let source = void 0;
export let exaggeration = void 0;
let specification = null;
$: if ($map && source) {
  specification = { source, exaggeration }, $map.setTerrain(specification);
}
onDestroy(() => {
  if ($map?.loaded() && specification) {
    $map.setTerrain(null);
  }
});
</script>
