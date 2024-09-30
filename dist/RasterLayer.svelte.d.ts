import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        id?: string;
        /** Set the source for this layer. This can be omitted when the Layer is created in the slot
           * of a source component. */ source?: string | undefined;
        /** Draw this layer under another layer. This is only evaluated when the component is created. */ beforeId?: string | undefined;
        /** Draw this layer all layers of this type. This is only evaluated when the component is created. */ beforeLayerType?: string | ((layer: maplibregl.LayerSpecification) => boolean) | undefined;
        paint: maplibregl.RasterLayerSpecification["paint"];
        layout?: maplibregl.RasterLayerSpecification["layout"] | undefined;
        minzoom?: number | undefined;
        maxzoom?: number | undefined;
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
export type RasterLayerProps = typeof __propDef.props;
export type RasterLayerEvents = typeof __propDef.events;
export type RasterLayerSlots = typeof __propDef.slots;
export default class RasterLayer extends SvelteComponentTyped<RasterLayerProps, RasterLayerEvents, RasterLayerSlots> {
}
export {};
