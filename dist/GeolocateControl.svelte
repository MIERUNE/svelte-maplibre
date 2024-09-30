<script>import { mapContext } from "./context";
import maplibregl from "maplibre-gl";
import { onDestroy } from "svelte";
const { map } = mapContext();
export let position = "top-left";
export let positionOptions = void 0;
export let fitBoundsOptions = void 0;
export let trackUserLocation = false;
export let showAccuracyCircle = true;
export let showUserLocation = true;
export let control = null;
$: if ($map && !control) {
  control = new maplibregl.GeolocateControl({
    positionOptions,
    fitBoundsOptions,
    trackUserLocation,
    showAccuracyCircle,
    showUserLocation
  });
  $map.addControl(control, position);
}
onDestroy(() => {
  if ($map?.loaded() && control) {
    $map.removeControl(control);
  }
});
</script>
