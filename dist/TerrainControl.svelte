<script>import { mapContext } from "./context.js";
import maplibregl from "maplibre-gl";
import { onDestroy } from "svelte";
const { map } = mapContext();
export let position = "top-left";
export let source;
export let exaggeration;
let control = null;
$: if ($map && !control) {
  control = new maplibregl.TerrainControl({ source, exaggeration }), $map.addControl(control, position);
}
onDestroy(() => {
  if ($map?.loaded() && control) {
    $map.removeControl(control);
  }
});
</script>
