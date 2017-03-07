declare module "ol3-popup/paging/paging" {
    import ol = require("openlayers");
    import { Popup } from "ol3-popup/ol3-popup";
    export type SourceType = HTMLElement | string | JQueryDeferred<HTMLElement | string>;
    export type SourceCallback = () => SourceType;
    export interface IPaging {
        indexOf(feature: ol.Feature): number;
    }
    export class Paging extends ol.Observable implements IPaging {
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
            element: HTMLElement;
            callback?: SourceCallback;
            feature?: ol.Feature;
            location?: ol.geom.Geometry;
        };
        readonly activeIndex: number;
        readonly count: number;
        on(name: string, listener: () => void): any;
        on(name: "add", listener: (evt: {
            pageIndex: number;
            feature: ol.Feature;
            element: HTMLElement;
            geom: ol.geom.Geometry;
        }) => void): any;
        on(name: "clear", listener: () => void): any;
        on(name: "goto", listener: () => void): any;
        addFeature(feature: ol.Feature, options: {
            searchCoordinate: ol.Coordinate;
        }): void;
        add(source: SourceType | SourceCallback, geom?: ol.geom.Geometry): void;
        clear(): void;
        goto(index: number): void;
        next(): void;
        prev(): void;
        indexOf(feature: ol.Feature): number;
    }
}
declare module "ol3-popup/paging/page-navigator" {
    import ol = require("openlayers");
    import { Paging } from "ol3-popup/paging/paging";
    export default class PageNavigator extends ol.Observable {
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
        template(): string;
        hide(): void;
        show(): void;
    }
}
declare module "bower_components/ol3-fun/ol3-fun/common" {
    export function parse<T>(v: string, type: T): T;
    export function getQueryParameters(options: any, url?: string): void;
    export function getParameterByName(name: string, url?: string): string;
    export function doif<T>(v: T, cb: (v: T) => void): void;
    export function mixin<A extends any, B extends any>(a: A, b: B): A & B;
    export function defaults<A extends any, B extends any>(a: A, ...b: B[]): A & B;
    export function cssin(name: string, css: string): () => void;
    export function debounce(func: () => void, wait?: number): () => void;
    export function html(html: string): HTMLElement;
}
declare module "ol3-popup/interaction" {
    import ol = require("openlayers");
    import { Popup } from "ol3-popup/ol3-popup";
    export interface IOptions extends olx.interaction.SelectOptions {
        map?: ol.Map;
        popup?: Popup;
        showCoordinates?: boolean;
    }
    export class SelectInteraction {
        private handlers;
        options: IOptions;
        static DEFAULT_OPTIONS: IOptions;
        static create(options: IOptions): SelectInteraction;
        private constructor(options);
        private setupOverlay();
        destroy(): void;
    }
}
declare module "bower_components/ol3-symbolizer/ol3-symbolizer/format/base" {
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
declare module "bower_components/ol3-symbolizer/index" {
    import Symbolizer = require("bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer");
    export = Symbolizer;
}
declare module "ol3-popup/ol3-popup" {
    import ol = require("openlayers");
    import { Paging } from "ol3-popup/paging/paging";
    export interface IPopupOptions extends olx.OverlayOptions {
        map: ol.Map;
        multi?: boolean;
        autoPopup?: boolean;
        dockContainer?: HTMLElement;
        css?: string;
        pointerPosition?: number;
        xOffset?: number;
        yOffset?: number;
        pagingStyle?: (feature: ol.Feature, resolution: number, page: number) => ol.style.Style[];
        asContent?: (feature: ol.Feature) => HTMLElement;
    }
    export interface IPopup_4_0_1<T> {
        show(position: ol.Coordinate, markup: string): T;
        hide(): T;
        isOpened(): boolean;
        destroy(): void;
        panIntoView(): void;
        isDocked(): boolean;
        applyOffset([x, y]: [number, number]): any;
        setPointerPosition(offset: number): any;
    }
    export interface IPopup extends IPopup_4_0_1<Popup> {
    }
    export class Popup extends ol.Overlay implements IPopup {
        options: IPopupOptions & {
            parentNode?: HTMLElement;
        };
        content: HTMLDivElement;
        domNode: HTMLDivElement;
        private closer;
        private docker;
        pages: Paging;
        private handlers;
        static create(options: IPopupOptions): Popup;
        private constructor(options);
        private injectCss(css);
        setIndictorPosition(): void;
        setPointerPosition(offset: number): void;
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
        applyOffset([x, y]: number[]): void;
    }
}
declare module "index" {
    import Popup = require("ol3-popup/ol3-popup");
    export = Popup;
}
declare module "ol3-popup/examples/docking" {
    export function run(): void;
}
declare module "ol3-popup/examples/extras/feature-creator" {
    import ol = require("openlayers");
    class FeatureCreator {
        options: {
            map: ol.Map;
        };
        static create(options: {
            map: ol.Map;
        }): FeatureCreator;
        constructor(options: {
            map: ol.Map;
        });
        addSomeFeatures(vectorLayer: ol.layer.Vector, center: ol.Coordinate): void;
    }
    export = FeatureCreator;
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
declare module "ol3-popup/examples/multi" {
    export function run(): void;
}
declare module "ol3-popup/examples/paging" {
    export function run(): void;
}
declare module "ol3-popup/examples/simple" {
    export function run(): void;
}
declare module "ol3-popup/examples/style-offset" {
    export function run(): void;
}
