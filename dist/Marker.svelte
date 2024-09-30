<script>import maplibre, {} from "maplibre-gl";
import { createEventDispatcher } from "svelte";
import { updatedMarkerContext } from "./context";
let markerProp = void 0;
export { markerProp as marker };
export let lngLat;
let classNames = void 0;
export { classNames as class };
export let interactive = true;
export let asButton = false;
export let draggable = false;
export let feature = null;
export let offset = void 0;
export let zIndex = void 0;
export let rotation = 0;
export let opacity = 1;
const dispatch = createEventDispatcher();
const { map, layerEvent, self: marker, markerClickManager } = updatedMarkerContext();
function addMarker(node) {
  $marker = new maplibre.Marker({
    element: node,
    rotation,
    draggable,
    offset,
    opacity: opacity.toString()
  }).setLngLat(lngLat).addTo($map);
  markerProp = $marker;
  const dragStartListener = () => sendEvent("dragstart");
  const dragListener = () => {
    propagateLngLatChange();
    sendEvent("drag");
  };
  const dragEndListener = () => {
    propagateLngLatChange();
    sendEvent("dragend");
  };
  if (draggable) {
    $marker.on("dragstart", dragStartListener);
    $marker.on("drag", dragListener);
    $marker.on("dragend", dragEndListener);
  }
  return {
    destroy() {
      if (draggable) {
        $marker?.off("dragstart", dragStartListener);
        $marker?.off("drag", dragListener);
        $marker?.off("dragend", dragEndListener);
      }
      markerProp = void 0;
      $marker?.remove();
    }
  };
}
function manageClasses(node, initialAddedClasses) {
  const frozenClasses = node.className;
  function updateClasses(newClassNames) {
    if (newClassNames) {
      node.className = `${frozenClasses} ${newClassNames}`;
    } else {
      node.className = frozenClasses;
    }
  }
  updateClasses(initialAddedClasses);
  return {
    update: updateClasses
  };
}
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
function handleKeyDown(e) {
  if (e.key === " ") {
    e.preventDefault();
    e.stopPropagation();
    sendEvent("click");
  }
}
function sendEvent(eventName) {
  if (!interactive) {
    return;
  }
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
  if (eventName === "click" || eventName === "contextmenu") {
    markerClickManager.handleClick(data);
  }
  $layerEvent = {
    ...data,
    layerType: "marker",
    type: eventName
  };
  dispatch(eventName, data);
}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  use:addMarker
  use:manageClasses={classNames}
  style:z-index={zIndex}
  tabindex={asButton ? 0 : undefined}
  role={asButton ? 'button' : undefined}
  on:click|stopPropagation={() => sendEvent('click')}
  on:dblclick|stopPropagation={() => sendEvent('dblclick')}
  on:contextmenu|stopPropagation|preventDefault={() => {
    sendEvent('contextmenu');
  }}
  on:mouseenter={() => {
    sendEvent('mouseenter');
  }}
  on:mouseleave={() => {
    sendEvent('mouseleave');
  }}
  on:mousemove={() => sendEvent('mousemove')}
  on:keydown={handleKeyDown}
>
  <slot marker={$marker} />
</div>
