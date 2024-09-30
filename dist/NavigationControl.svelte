<script>import { mapContext } from "./context";
import maplibregl from "maplibre-gl";
import { onDestroy } from "svelte";
const { map } = mapContext();
export let position = "top-left";
export let showCompass = true;
export let showZoom = true;
export let visualizePitch = false;
let control = null;
$: if ($map && !control) {
  control = new maplibregl.NavigationControl({ showCompass, showZoom, visualizePitch }), $map.addControl(control, position);
}
onDestroy(() => {
  if ($map?.loaded() && control) {
    $map.removeControl(control);
  }
});
</script>
