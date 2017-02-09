declare module "ol3-popup/paging/paging" {
    import ol = require("openlayers");
    import { Popup } from "ol3-popup/ol3-popup";
    export type SourceType = HTMLElement | string | JQueryDeferred<HTMLElement | string>;
    export type SourceCallback = () => SourceType;
    /**
     * Collection of "pages"
     */
    export class Paging {
        options: {
            popup: Popup;
        };
        private _pages;
        private _activeIndex;
        domNode: HTMLDivElement;
        constructor(options: {
            popup: Popup;
        });
        readonly activePage: {
            callback?: SourceCallback;
            element: HTMLElement;
            location: ol.geom.Geometry;
        };
        readonly activeIndex: number;
        readonly count: number;
        dispatch(name: string): void;
        on(name: string, listener: EventListener): void;
        add(source: SourceType | SourceCallback, geom?: ol.geom.Geometry): void;
        clear(): void;
        goto(index: number): void;
        next(): void;
        prev(): void;
    }
}
declare module "ol3-popup/paging/page-navigator" {
    import { Paging } from "ol3-popup/paging/paging";
    /**
     * The prior + next paging buttons and current page indicator
     */
    class PageNavigator {
        options: {
            pages: Paging;
        };
        private domNode;
        prevButton: HTMLButtonElement;
        nextButton: HTMLButtonElement;
        pageInfo: HTMLSpanElement;
        constructor(options: {
            pages: Paging;
        });
        dispatch(name: string): void;
        on(name: string, listener: EventListener): void;
        template(): string;
        hide(): void;
        show(): void;
    }
    export = PageNavigator;
}
declare module "ol3-popup/ol3-popup" {
    import ol = require("openlayers");
    import { Paging } from "ol3-popup/paging/paging";
    /**
     * The constructor options 'must' conform, most interesting is autoPan
     */
    export interface IPopupOptions_2_0_4 extends olx.OverlayOptions {
        autoPan?: boolean;
        autoPanAnimation?: {
            duration: number;
            source: any;
        };
        autoPanMargin?: number;
        insertFirst?: boolean;
        stopEvent?: boolean;
        offset?: [number, number];
        positioning?: string;
        position?: [number, number];
    }
    export interface IPopupOptions_2_0_5 extends IPopupOptions_2_0_4 {
        dockContainer?: JQuery | string | HTMLElement;
    }
    export interface IPopupOptions_2_0_6 extends IPopupOptions_2_0_5 {
        css?: string;
        pointerPosition?: number;
    }
    export interface IPopupOptions_2_0_7 extends IPopupOptions_2_0_6 {
        xOffset?: number;
        yOffset?: number;
    }
    export interface IPopupOptions_3_20_1 extends IPopupOptions_2_0_7 {
    }
    export interface IPopupOptions extends IPopupOptions_3_20_1 {
    }
    /**
     * This is the contract that will not break between versions
     */
    export interface IPopup_2_0_4<T> {
        show(position: ol.Coordinate, markup: string): T;
        hide(): T;
    }
    export interface IPopup_2_0_5<T> extends IPopup_2_0_4<T> {
        isOpened(): boolean;
        destroy(): void;
        panIntoView(): void;
        isDocked(): boolean;
    }
    export interface IPopup_3_20_1<T> extends IPopup_2_0_5<T> {
        applyOffset([x, y]: [number, number]): any;
        setIndicatorPosition(offset: number): any;
    }
    export interface IPopup extends IPopup_3_20_1<Popup> {
    }
    /**
     * The control formerly known as ol.Overlay.Popup
     */
    export class Popup extends ol.Overlay implements IPopup {
        options: IPopupOptions & {
            map?: ol.Map;
            parentNode?: HTMLElement;
        };
        content: HTMLDivElement;
        domNode: HTMLDivElement;
        private closer;
        private docker;
        pages: Paging;
        private handlers;
        constructor(options?: IPopupOptions);
        private postCreate();
        private injectCss(css);
        setIndicatorPosition(offset: number): void;
        setPosition(position: ol.Coordinate): void;
        panIntoView(): void;
        destroy(): void;
        dispatch(name: string): void;
        show(coord: ol.Coordinate, html: string | HTMLElement): this;
        hide(): this;
        isOpened(): boolean;
        isDocked(): boolean;
        dock(): void;
        undock(): void;
        applyOffset([x, y]: [number, number]): void;
    }
}
declare module "ol3-popup" {
    /**
     * forces 'ol3-popup' namespace
     */
    import Popup = require("ol3-popup/ol3-popup");
    export = Popup;
}
declare module "ol3-popup/examples/flash-style" {
    let style: {
        "circle": {
            "fill": {
                "gradient": {
                    "type": string;
                    "stops": string;
                };
            };
            "opacity": number;
            "stroke": {
                "color": string;
                "width": number;
            };
            "radius": number;
            "rotation": number;
        };
    }[];
    export = style;
}
declare module "ol3-popup/examples/index" {
    export function run(): void;
}
declare module "ol3-popup/extras/feature-creator" {
    import ol = require("openlayers");
    /**
     * Used for testing, will create features when Alt+Clicking the map
     */
    class FeatureCreator {
        options: {
            map: ol.Map;
        };
        constructor(options: {
            map: ol.Map;
        });
    }
    export = FeatureCreator;
}
declare module "ol3-popup/extras/feature-selector" {
    import ol = require("openlayers");
    import { Popup } from "ol3-popup/ol3-popup";
    /**
     * Interaction which opens the popup when zero or more features are clicked
     */
    class FeatureSelector {
        options: {
            map: ol.Map;
            popup: Popup;
            title: string;
        };
        constructor(options: {
            map: ol.Map;
            popup: Popup;
            title: string;
        });
    }
    export = FeatureSelector;
}
declare module "ol3-popup/examples/paging" {
    export function run(): void;
}
declare module "bower_components/ol3-symbolizer/ol3-symbolizer/format/base" {
    /**
     * implemented by all style serializers
     */
    export interface IConverter<T> {
        fromJson: (json: T) => ol.style.Style;
        toJson(style: ol.style.Style): T;
    }
}
declare module "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer" {
    import ol = require("openlayers");
    import Serializer = require("bower_components/ol3-symbolizer/ol3-symbolizer/format/base");
    export namespace Format {
        type Color = number[] | string;
        type Size = number[];
        type Offset = number[];
        type LineDash = number[];
        interface Fill {
            color?: string;
        }
        interface Stroke {
            color?: string;
            width?: number;
            lineCap?: string;
            lineJoin?: string;
            lineDash?: LineDash;
            miterLimit?: number;
        }
        interface Style {
            fill?: Fill;
            image?: Image;
            stroke?: Stroke;
            text?: Text;
            zIndex?: number;
        }
        interface Image {
            opacity?: number;
            rotateWithView?: boolean;
            rotation?: number;
            scale?: number;
            snapToPixel?: boolean;
        }
        interface Circle {
            radius: number;
            stroke?: Stroke;
            fill?: Fill;
            snapToPixel?: boolean;
        }
        interface Star extends Image {
            angle?: number;
            fill?: Fill;
            points?: number;
            stroke?: Stroke;
            radius?: number;
            radius2?: number;
        }
        interface Icon extends Image {
            anchor?: Offset;
            anchorOrigin?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
            anchorXUnits?: "fraction" | "pixels";
            anchorYUnits?: "fraction" | "pixels";
            color?: Color;
            crossOrigin?: string;
            src?: string;
            offset?: Offset;
            offsetOrigin?: 'top_left' | 'top_right' | 'bottom-left' | 'bottom-right';
            size?: Size;
        }
        interface Text {
            fill?: Fill;
            font?: string;
            offsetX?: number;
            offsetY?: number;
            rotation?: number;
            scale?: number;
            stroke?: Stroke;
            text?: string;
            textAlign?: string;
            textBaseline?: string;
        }
    }
    export namespace Format {
        interface Style {
            image?: Icon & Svg;
            icon?: Icon;
            svg?: Svg;
            star?: Star;
            circle?: Circle;
            text?: Text;
            fill?: Fill;
            stroke?: Stroke;
        }
        interface Icon {
            "anchor-x"?: number;
            "anchor-y"?: number;
        }
        interface Text {
            "offset-x"?: number;
            "offset-y"?: number;
        }
        interface Circle {
            opacity?: number;
        }
        interface Svg {
            anchor?: Offset;
            anchorOrigin?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
            anchorXUnits?: string;
            anchorYUnits?: string;
            color?: Color;
            crossOrigin?: string;
            img?: string;
            imgSize?: Size;
            offset?: Offset;
            offsetOrigin?: 'top_left' | 'top_right' | 'bottom-left' | 'bottom-right';
            path?: string;
            stroke?: Stroke;
            fill?: Fill;
        }
    }
    export class StyleConverter implements Serializer.IConverter<Format.Style> {
        fromJson(json: Format.Style): ol.style.Style;
        toJson(style: ol.style.Style): Format.Style;
        /**
         * uses the interior point of a polygon when rendering a 'point' style
         */
        setGeometry(feature: ol.Feature): ol.geom.Geometry;
        private assign(obj, prop, value);
        private serializeStyle(style);
        private serializeColor(color);
        private serializeFill(fill);
        private deserializeStyle(json);
        private deserializeText(json);
        private deserializeCircle(json);
        private deserializeStar(json);
        private deserializeIcon(json);
        private deserializeSvg(json);
        private deserializeFill(json);
        private deserializeStroke(json);
        private deserializeColor(fill);
        private deserializeLinearGradient(json);
        private deserializeRadialGradient(json);
    }
}
declare module "bower_components/ol3-symbolizer/ol3-symbolizer" {
    import Symbolizer = require("bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer");
    export = Symbolizer;
}
declare module "ol3-popup/examples/style-offset" {
    export function run(): void;
}
