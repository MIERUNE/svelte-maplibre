<script>import { createEventDispatcher, onDestroy } from "svelte";
import { mapContext } from "./context";
import maplibregl from "maplibre-gl";
const dispatch = createEventDispatcher();
export let layer = void 0;
const { map } = mapContext();
function sendEvent(e) {
  dispatch(
    // @ts-expect-error
    e.type,
    { ...e, map }
  );
}
const layerEvents = [
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "contextmenu",
  "mouseover",
  "mouseout"
];
const mapEvents = [
  "click",
  "dblclick",
  "contextmenu",
  "mousemove",
  "movestart",
  "moveend",
  "zoomstart",
  "zoom",
  "zoomend"
];
$: if ($map) {
  if (layer) {
    for (const eventName of layerEvents) {
      $map.on(eventName, layer, sendEvent);
    }
  } else {
    for (const eventName of mapEvents) {
      $map.on(eventName, sendEvent);
    }
  }
}
onDestroy(() => {
  if ($map) {
    if (layer) {
      for (const eventName of layerEvents) {
        $map.off(eventName, layer, sendEvent);
      }
    } else {
      for (const eventName of mapEvents) {
        $map.off(eventName, sendEvent);
      }
    }
  }
});
</script>
