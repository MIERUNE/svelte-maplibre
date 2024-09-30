<script>import { mapContext } from "./context.js";
import maplibregl from "maplibre-gl";
import { onDestroy } from "svelte";
const { map } = mapContext();
export let position = "top-left";
export let container = void 0;
let control = null;
$: if ($map && !control) {
  let containerEl;
  if (typeof container === "string") {
    containerEl = document.querySelector(container) ?? void 0;
  } else {
    containerEl = container;
  }
  control = new maplibregl.FullscreenControl({
    container: containerEl
  });
  $map.addControl(control, position);
}
onDestroy(() => {
  if ($map?.loaded() && control) {
    $map.removeControl(control);
  }
});
</script>
