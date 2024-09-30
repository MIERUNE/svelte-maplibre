<script>import maplibre, {} from "maplibre-gl";
import { createEventDispatcher, onDestroy } from "svelte";
import { updatedMarkerContext } from "./context";
import flush from "just-flush";
let markerProp = void 0;
export { markerProp as marker };
export let lngLat;
let classNames = void 0;
export { classNames as class };
export let draggable = false;
export let feature = null;
export let offset = void 0;
export let rotation = 0;
export let opacity = 1;
const dispatch = createEventDispatcher();
const { map, layerEvent, self: marker } = updatedMarkerContext();
const dragStartListener = () => sendEvent("dragstart");
const dragListener = () => {
  propagateLngLatChange();
  sendEvent("drag");
};
const dragEndListener = () => {
  propagateLngLatChange();
  sendEvent("dragend");
};
$marker = new maplibre.Marker(
  flush({
    draggable,
    rotation,
    className: classNames,
    offset,
    opacity: opacity.toString()
  })
).setLngLat(lngLat).addTo($map);
markerProp = $marker;
if (draggable) {
  $marker.on("dragstart", dragStartListener);
  $marker.on("drag", dragListener);
  $marker.on("dragend", dragEndListener);
}
onDestroy(() => {
  markerProp = void 0;
  $marker?.remove();
});
$: $marker?.setLngLat(lngLat);
$: $marker?.setOffset(offset ?? [0, 0]);
$: $marker?.setRotation(rotation);
$: $marker?.setOpacity(opacity.toString());
function propagateLngLatChange() {
  let newPos = $marker?.getLngLat();
  if (!newPos) {
    return;
  }
  if (Array.isArray(lngLat)) {
    lngLat = [newPos.lng, newPos.lat];
  } else if (lngLat && "lon" in lngLat) {
    lngLat = { lon: newPos.lng, lat: newPos.lat };
  } else {
    lngLat = newPos;
  }
}
function sendEvent(eventName) {
  let loc = $marker?.getLngLat();
  if (!loc) {
    return;
  }
  const lngLat2 = [loc.lng, loc.lat];
  let data = {
    map: $map,
    marker: $marker,
    lngLat: lngLat2,
    features: [
      {
        type: "Feature",
        properties: feature?.properties ?? {},
        geometry: {
          type: "Point",
          coordinates: lngLat2
        }
      }
    ]
  };
  $layerEvent = {
    ...data,
    layerType: "marker",
    type: eventName
  };
  dispatch(eventName, data);
}
</script>

<slot marker={$marker} />
