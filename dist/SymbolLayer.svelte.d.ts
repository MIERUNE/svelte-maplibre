import { SvelteComponentTyped } from "svelte";
import type { Feature } from 'geojson';
declare const __propDef: {
    props: {
        id?: string;
        /** Set the source for this layer. This can be omitted when the Layer is created in the slot
           * of a source component. */ source?: string | undefined;
        /** When setting up a layer for a vector tile source, the source layer to which this layer corresponds. */ sourceLayer?: string | undefined;
        /** Draw this layer under another layer. This is only evaluated when the component is created. */ beforeId?: string | undefined;
        /** Draw this layer all layers of this type. This is only evaluated when the component is created. */ beforeLayerType?: string | ((layer: maplibregl.LayerSpecification) => boolean) | undefined;
        paint?: maplibregl.SymbolLayerSpecification["paint"] | undefined;
        layout?: maplibregl.SymbolLayerSpecification["layout"] | undefined;
        filter?: maplibregl.ExpressionSpecification | undefined;
        applyToClusters?: boolean | undefined;
        minzoom?: number | undefined;
        maxzoom?: number | undefined;
        /** Set the cursor style to this value when the mouse is over the layer. */ hoverCursor?: string | undefined;
        /** Enable to use hoverStateFilter or filter on `hover-state`. Features must have an `id` property for this to work. */ manageHoverState?: boolean;
        hovered?: Feature | null;
        eventsIfTopMost?: boolean;
        /** Handle mouse events on this layer. */ interactive?: boolean;
    };
    events: {
        click: CustomEvent<import("./types").LayerClickInfo>;
        dblclick: CustomEvent<import("./types").LayerClickInfo>;
        contextmenu: CustomEvent<import("./types").LayerClickInfo>;
        mouseenter: CustomEvent<import("./types").LayerClickInfo>;
        mousemove: CustomEvent<import("./types").LayerClickInfo>;
        mouseleave: CustomEvent<Pick<import("./types").LayerClickInfo, "source" | "map" | "layer">>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type SymbolLayerProps = typeof __propDef.props;
export type SymbolLayerEvents = typeof __propDef.events;
export type SymbolLayerSlots = typeof __propDef.slots;
export default class SymbolLayer extends SvelteComponentTyped<SymbolLayerProps, SymbolLayerEvents, SymbolLayerSlots> {
}
export {};
