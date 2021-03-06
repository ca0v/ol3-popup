import ol = require("openlayers");
import { olx } from "openlayers";

export enum Positions {
	bl = "bottom-left",
	bc = "bottom-center",
	br = "bottom-right",
	cl = "center-left",
	cc = "center-center",
	cr = "center-right",
	tl = "top-left",
	tc = "top-center",
	tr = "top-right"
}

export type Indicators = { [TKey in Positions]: string | HTMLElement };
export type IndicatorOffsets = { [TKey in Positions]: ol.Pixel };

/**
 * The constructor options 'must' conform, most interesting is autoPan
 */
export interface PopupOptions extends olx.OverlayOptions {
	offset?: ol.Pixel;
	indicators?: Indicators;
	indicatorOffsets?: IndicatorOffsets;
	map?: ol.Map;
	// allow multiple popups or automatically close before re-opening?
	multi?: boolean;
	// automatically listen for map click event and open popup
	autoPopup?: boolean;
	// automatically adjust the positioning to minimize panning
	autoPositioning?: boolean;
	// allows popup to dock w/in this container
	dockContainer?: HTMLElement;
	// facilitates styling by adding a class name
	className?: string;
	// css content to add to DOM for the lifecycle of this control
	css?: string;
	positioning?: ol.OverlayPositioning; //shadow for stricter typings
	// where should the infoviewer callout be placed relative to the edge?
	pointerPosition?: number;
	// how to style paged features
	pagingStyle?: (feature: ol.Feature, resolution: number, page: number) => ol.style.Style[];
	// how to render a feature
	asContent?: (feature: ol.Feature) => HTMLElement;
	// which layers to consider
	layers?: ol.layer.Vector[];
	// when no features found show coordinates isntead
	showCoordinates?: boolean;
}
