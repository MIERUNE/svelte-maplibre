<script>import { updatedLayerContext } from "./context";
export let data;
export let idCol;
export let sourceLayer = void 0;
let lastSeenIds = /* @__PURE__ */ new Set();
const { map, source } = updatedLayerContext();
$: if (data && $map && $source) {
  let seenIds = /* @__PURE__ */ new Set();
  for (const row of data) {
    const id = row[idCol];
    if (!id) continue;
    lastSeenIds.delete(id);
    seenIds.add(id);
    const featureSelector = { id, source: $source, sourceLayer };
    const oldState = $map.getFeatureState(featureSelector);
    let needsUpdate = false;
    for (const property of Object.keys(row)) {
      if (oldState[property] !== row[property]) {
        needsUpdate = true;
        break;
      }
    }
    if (needsUpdate) {
      $map.setFeatureState(featureSelector, row);
    }
  }
  for (const removeId of lastSeenIds) {
    const featureSelector = { id: removeId, source: $source, sourceLayer };
    const oldState = $map.getFeatureState(featureSelector);
    for (const property of Object.keys(oldState)) {
      $map.removeFeatureState(featureSelector, property);
    }
  }
  lastSeenIds = seenIds;
}
</script>
