import { SvelteComponentTyped } from "svelte";
import type { LayerClickInfo } from './types.js';
import type * as GeoJSON from 'geojson';
declare const __propDef: {
    props: {
        id?: string;
        /** Set the source for this layer. This can be omitted when the Layer is created in the slot
           * of a source component. */ source?: string | undefined;
        /** When setting up a layer for a vector tile source, the source layer to which this layer corresponds. */ sourceLayer?: string | undefined;
        /** Draw this layer under another layer. This is only evaluated when the component is created. */ beforeId?: string | undefined;
        /** Calculate beforeId so that this layer appears below all layers of a particular type.
           * If this is a function, this layer will be added before the first layer for which
           * the function returns true.*/ beforeLayerType?: string | ((layer: maplibregl.LayerSpecification) => boolean) | undefined;
        type: maplibregl.LayerSpecification["type"];
        paint?: object | undefined;
        layout?: object | undefined;
        filter?: maplibregl.ExpressionSpecification | undefined;
        applyToClusters?: boolean | undefined;
        minzoom?: number | undefined;
        maxzoom?: number | undefined;
        /** Enable to use hoverStateFilter or filter on `hover-state`. Features must have an `id` property for this to work. */ manageHoverState?: boolean;
        /** The feature currently being hovered. */ hovered?: GeoJSON.Feature | null;
        /** Handle mouse events on this layer. */ interactive?: boolean;
        hoverCursor?: string | undefined;
        eventsIfTopMost?: boolean;
    };
    events: {
        click: CustomEvent<LayerClickInfo>;
        dblclick: CustomEvent<LayerClickInfo>;
        contextmenu: CustomEvent<LayerClickInfo>;
        mouseenter: CustomEvent<LayerClickInfo>;
        mousemove: CustomEvent<LayerClickInfo>;
        mouseleave: CustomEvent<Pick<LayerClickInfo, "source" | "map" | "layer">>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type LayerProps = typeof __propDef.props;
export type LayerEvents = typeof __propDef.events;
export type LayerSlots = typeof __propDef.slots;
/**
 * A component that handles a generic layer. This is intended for use by other type-specific
 * layer components, such as FillLayer, and usually you will want to use one of those in your
 * code instead of directly using this component.
 */
export default class Layer extends SvelteComponentTyped<LayerProps, LayerEvents, LayerSlots> {
}
export {};
