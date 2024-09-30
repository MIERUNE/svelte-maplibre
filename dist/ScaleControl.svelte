<script>import { mapContext } from "./context";
import maplibregl from "maplibre-gl";
import { onDestroy } from "svelte";
const { map } = mapContext();
export let position = "bottom-left";
export let maxWidth = void 0;
export let unit = "metric";
let control = null;
$: if ($map && !control) {
  control = new maplibregl.ScaleControl({
    maxWidth,
    unit
  });
  $map.addControl(control, position);
}
onDestroy(() => {
  if ($map?.loaded() && control) {
    $map.removeControl(control);
  }
});
</script>
