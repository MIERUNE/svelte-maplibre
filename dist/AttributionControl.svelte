<script>import { mapContext } from "./context";
import maplibregl from "maplibre-gl";
import { onDestroy } from "svelte";
const { map } = mapContext();
export let position = "bottom-right";
export let compact = false;
export let customAttribution = void 0;
let control = null;
$: if ($map && !control) {
  control = new maplibregl.AttributionControl({
    compact,
    customAttribution
  });
  $map.addControl(control, position);
}
onDestroy(() => {
  if ($map?.loaded() && control) {
    $map.removeControl(control);
  }
});
</script>
