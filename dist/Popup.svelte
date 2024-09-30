<script>import maplibregl, {
} from "maplibre-gl";
import { onDestroy, onMount, createEventDispatcher } from "svelte";
import { mapContext, isDeckGlMouseEvent } from "./context.js";
export let closeButton = void 0;
export let closeOnClickOutside = true;
export let closeOnClickInside = false;
export let closeOnMove = false;
export let openOn = "click";
export let openIfTopMost = true;
export let focusAfterOpen = true;
export let anchor = void 0;
export let offset = void 0;
export let popupClass = void 0;
export let maxWidth = void 0;
export let lngLat = void 0;
export let html = void 0;
export let open = false;
const dispatch = createEventDispatcher();
const { map, popupTarget, layerEvent, layer, eventTopMost, markerClickManager } = mapContext();
const clickEvents = ["click", "dblclick", "contextmenu"];
$: actualCloseButton = closeButton ?? (!closeOnClickOutside && !closeOnClickInside);
let popup;
$: if (!popup) {
  popup = new maplibregl.Popup({
    closeButton: actualCloseButton,
    // We handle this ourselves to improve behavior on mobile.
    closeOnClick: false,
    closeOnMove,
    focusAfterOpen,
    maxWidth,
    className: popupClass,
    anchor,
    offset
  });
  popupElement = popup.getElement();
  popup.on("open", () => {
    open = true;
    setPopupClickHandler();
    dispatch("open", popup);
  });
  popup.on("close", () => {
    open = false;
    dispatch("close", popup);
  });
  popup.on("hover", () => {
    dispatch("hover", popup);
  });
}
let hoveringOnPopup = false;
let popupElement;
function setPopupClickHandler() {
  if (!popup) {
    return;
  }
  let el = popup.getElement();
  if (!el || el === popupElement) {
    return;
  }
  popupElement = el;
  if (openOn === "hover") {
    popupElement.style.pointerEvents = "none";
  }
  popupElement.addEventListener(
    "mouseenter",
    () => {
      hoveringOnPopup = true;
    },
    { passive: true }
  );
  popupElement.addEventListener(
    "mouseleave",
    () => {
      hoveringOnPopup = false;
    },
    { passive: true }
  );
  popupElement.addEventListener(
    "click",
    () => {
      if (closeOnClickInside) {
        open = false;
      }
    },
    { passive: true }
  );
}
$: if (popup && $popupTarget instanceof maplibregl.Marker) {
  if (openOn === "click") {
    $popupTarget.setPopup(popup);
  } else if ($popupTarget.getPopup() === popup) {
    $popupTarget.setPopup(void 0);
  }
}
onMount(() => {
  if (!$map) {
    return;
  }
  $map.on("click", globalClickHandler);
  $map.on("contextmenu", globalClickHandler);
  markerClickManager.add(globalMarkerClickHandler);
  if (typeof $popupTarget === "string") {
    $map.on("click", $popupTarget, handleLayerClick);
    $map.on("dblclick", $popupTarget, handleLayerClick);
    $map.on("contextmenu", $popupTarget, handleLayerClick);
    $map.on("mousemove", $popupTarget, handleLayerMouseMove);
    $map.on("mouseleave", $popupTarget, handleLayerMouseLeave);
    $map.on("touchstart", $popupTarget, handleLayerTouchStart);
    $map.on("touchend", $popupTarget, handleLayerTouchEnd);
  }
  return () => {
    if ($map?.loaded()) {
      popup?.remove();
      $map.off("click", globalClickHandler);
      $map.off("contextmenu", globalClickHandler);
      markerClickManager.remove(globalMarkerClickHandler);
      if ($popupTarget instanceof maplibregl.Marker) {
        if ($popupTarget.getPopup() === popup) {
          $popupTarget.setPopup(void 0);
        }
      } else if (typeof $popupTarget === "string") {
        $map.off("click", $popupTarget, handleLayerClick);
        $map.off("dblclick", $popupTarget, handleLayerClick);
        $map.off("contextmenu", $popupTarget, handleLayerClick);
        $map.off("mousemove", $popupTarget, handleLayerMouseMove);
        $map.off("mouseleave", $popupTarget, handleLayerMouseLeave);
        $map.off("touchstart", $popupTarget, handleLayerTouchStart);
        $map.off("touchend", $popupTarget, handleLayerTouchEnd);
      }
    }
  };
});
function skipHandlingEvent(e) {
  if (!openIfTopMost) {
    return false;
  }
  return !("marker" in e) && !isDeckGlMouseEvent(e) && eventTopMost(e) !== $layer;
}
let features = null;
let touchOpenState = "normal";
function handleLayerEvent(e) {
  if ("layerType" in e && e.layerType === "deckgl") {
    lngLat = e.coordinate;
    features = e.object ? [e.object] : null;
  } else {
    lngLat = e.lngLat;
    features = e.features ?? [];
  }
}
function handleLayerClick(e) {
  if (e.type !== openOn || skipHandlingEvent(e)) {
    return;
  }
  handleLayerEvent(e);
  setTimeout(() => open = true);
}
let touchStartCoords = null;
function handleLayerTouchStart(e) {
  touchStartCoords = e.point;
}
function handleLayerTouchEnd(e) {
  if (!touchStartCoords || openOn !== "hover") {
    return;
  }
  let distance = touchStartCoords.dist(e.point);
  touchStartCoords = null;
  if (distance < 3) {
    lngLat = e.lngLat;
    features = e.features ?? [];
    if (popup.isOpen()) {
      touchOpenState = "justOpened";
    } else {
      touchOpenState = "opening";
      open = true;
    }
  }
}
function handleLayerMouseLeave(e) {
  if (openOn !== "hover" || touchStartCoords || touchOpenState !== "normal") {
    return;
  }
  open = false;
  features = null;
}
function handleLayerMouseMove(e) {
  if (openOn !== "hover" || touchStartCoords || touchOpenState !== "normal") {
    return;
  }
  if (skipHandlingEvent(e)) {
    open = false;
    features = null;
    return;
  }
  open = true;
  features = e.features ?? [];
  lngLat = e.lngLat;
}
function globalClickHandler(e) {
  if (touchOpenState === "justOpened") {
    touchOpenState = "normal";
    return;
  }
  if (!closeOnClickOutside) {
    return;
  }
  let checkElements = [
    popupElement,
    $popupTarget instanceof maplibregl.Marker ? $popupTarget?.getElement() : null
  ];
  if (open && popup.isOpen() && !checkElements.some((el) => el?.contains(e.originalEvent.target))) {
    if (e.type === "contextmenu" && openOn === "contextmenu" || e.type !== "contextmenu") {
      open = false;
    }
  }
}
function globalMarkerClickHandler(info) {
  if (closeOnClickOutside && open && popup.isOpen() && info.marker !== $popupTarget) {
    open = false;
  }
}
$: if (clickEvents.includes(openOn) && $layerEvent?.type === openOn) {
  handleLayerClick($layerEvent);
  $layerEvent = null;
}
$: hoveringOnLayer = openOn === "hover" && ($layerEvent?.type === "mousemove" || $layerEvent?.type === "mouseenter");
$: if (openOn === "hover" && layerEvent) {
  if (hoveringOnLayer && $layerEvent) {
    handleLayerEvent($layerEvent);
  }
  open = (hoveringOnLayer || hoveringOnPopup) ?? false;
}
$: if (popupEl) {
  popup.setDOMContent(popupEl);
} else if (html) {
  popup.setHTML(html);
}
$: if (lngLat) popup.setLngLat(lngLat);
$: if ($map) {
  let isOpen = popup.isOpen();
  if (open && !isOpen) {
    popup.addTo($map);
    if (touchOpenState === "opening") {
      touchOpenState = "justOpened";
    }
  } else if (!open && isOpen) {
    popup.remove();
  }
}
onDestroy(() => {
  if ($map && popup?.isOpen()) {
    popup.remove();
  }
});
let popupEl;
</script>

{#if $$slots.default}
  <div bind:this={popupEl}>
    {#if features?.length || $popupTarget instanceof maplibregl.Marker}
      <slot {features} data={features?.[0] ?? null} map={$map} close={() => (open = false)} />
    {/if}
  </div>
{/if}
