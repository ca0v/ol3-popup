/// <reference types="jquery" />
declare module "ol3-popup/paging/paging" {
    import ol = require("openlayers");
    import { Popup } from "ol3-popup/ol3-popup";
    export type SourceType = HTMLElement | string | JQueryDeferred<HTMLElement | string>;
    export type SourceCallback = () => SourceType;
    export interface IPaging {
        indexOf(feature: ol.Feature): number;
    }
    export interface IPage {
        element: HTMLElement;
        uid: string;
        callback?: SourceCallback;
        feature?: ol.Feature;
        location?: ol.geom.Geometry;
    }
    export class Paging extends ol.Observable implements IPaging {
        options: {
            popup: Popup;
        };
        private _pages;
        private _activePage;
        domNode: HTMLDivElement;
        constructor(options: {
            popup: Popup;
        });
        readonly activePage: IPage;
        readonly activeIndex: number;
        readonly count: number;
        on(name: string, listener: () => void): ol.EventsKey | ol.EventsKey[];
        on(name: "add", listener: (evt: {
            pageIndex: number;
            feature: ol.Feature;
            element: HTMLElement;
            geom: ol.geom.Geometry;
        }) => void): ol.EventsKey | ol.EventsKey[];
        on(name: "clear", listener: () => void): ol.EventsKey | ol.EventsKey[];
        on(name: "goto", listener: () => void): ol.EventsKey | ol.EventsKey[];
        on(name: "remove", listener: (evt: {
            pageIndex: number;
            feature: ol.Feature;
            element: HTMLElement;
            geom: ol.geom.Geometry;
        }) => void): ol.EventsKey | ol.EventsKey[];
        private findPage;
        private removePage;
        addFeature(feature: ol.Feature, options: {
            searchCoordinate: ol.Coordinate;
        }): IPage;
        add(source: SourceType | SourceCallback, geom: ol.geom.Geometry): IPage;
        clear(): void;
        goto(index: number | string): void;
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
declare module "node_modules/ol3-fun/ol3-fun/common" {
    export function uuid(): string;
    export function asArray<T extends HTMLInputElement>(list: NodeList | HTMLCollectionOf<Element>): T[];
    export function toggle(e: HTMLElement, className: string, force?: boolean): boolean;
    export function parse<T>(v: string, type: T): T;
    export function getQueryParameters(options: any, url?: string): void;
    export function getParameterByName(name: string, url?: string): string;
    export function doif<T>(v: T, cb: (v: T) => void): void;
    export function mixin<A extends any, B extends any>(a: A, ...b: B[]): A & B;
    export function defaults<A extends any, B extends any>(a: A, ...b: B[]): A & B;
    export function cssin(name: string, css: string): () => void;
    export function debounce<T extends Function>(func: T, wait?: number, immediate?: boolean): T;
    export function html(html: string): HTMLElement;
    export function pair<A, B>(a1: A[], a2: B[]): [A, B][];
    export function range(n: number): number[];
    export function shuffle<T>(array: T[]): T[];
}
declare module "ol3-popup/interaction" {
    import ol = require("openlayers");
    import { olx } from "openlayers";
    import { Popup } from "ol3-popup/ol3-popup";
    export interface SelectOptions extends olx.interaction.SelectOptions {
        map?: ol.Map;
        popup?: Popup;
        buffer?: number;
    }
    export class SelectInteraction extends ol.interaction.Select {
        private handlers;
        options: SelectOptions;
        static DEFAULT_OPTIONS: SelectOptions;
        static create(options: SelectOptions): SelectInteraction;
        private constructor();
        private setupOverlay;
        destroy(): void;
    }
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/common/assign" {
    export function assign(obj: any, prop: string, value: any): void;
}
declare module "node_modules/ol3-fun/ol3-fun/navigation" {
    import * as ol from "openlayers";
    export function zoomToFeature(map: ol.Map, feature: ol.Feature, options?: {
        duration?: number;
        padding?: number;
        minResolution?: number;
    }): JQuery.Deferred<any, any, any>;
}
declare module "node_modules/ol3-fun/ol3-fun/parse-dms" {
    export function parse(value: {
        lon: number;
        lat: number;
    }): string;
    export function parse(value: string): {
        lon: number;
        lat: number;
    } | number;
}
declare module "node_modules/ol3-fun/ol3-fun/slowloop" {
    export function slowloop(functions: Array<Function>, interval?: number, cycles?: number): JQuery.Deferred<any, any, any>;
}
declare module "node_modules/ol3-fun/ol3-fun/is-primitive" {
    export function isPrimitive(a: any): boolean;
}
declare module "node_modules/ol3-fun/ol3-fun/is-cyclic" {
    export function isCyclic(a: any): boolean;
}
declare module "node_modules/ol3-fun/ol3-fun/deep-extend" {
    export interface TraceItem {
        path?: string;
        target: Object;
        key: string | number;
        value: any;
        was: any;
    }
    type History = Array<object>;
    export function extend<A extends object>(a: A, b?: Partial<A>, trace?: TraceItem[], history?: History): A;
}
declare module "node_modules/ol3-fun/index" {
    import { asArray, cssin, debounce, defaults, doif, getParameterByName, getQueryParameters, html, mixin, pair, parse, range, shuffle, toggle, uuid } from "node_modules/ol3-fun/ol3-fun/common";
    import { zoomToFeature } from "node_modules/ol3-fun/ol3-fun/navigation";
    import { parse as dmsParse } from "node_modules/ol3-fun/ol3-fun/parse-dms";
    import { slowloop } from "node_modules/ol3-fun/ol3-fun/slowloop";
    import { extend as deepExtend } from "node_modules/ol3-fun/ol3-fun/deep-extend";
    let index: {
        asArray: typeof asArray;
        cssin: typeof cssin;
        debounce: typeof debounce;
        defaults: typeof defaults;
        doif: typeof doif;
        deepExtend: typeof deepExtend;
        getParameterByName: typeof getParameterByName;
        getQueryParameters: typeof getQueryParameters;
        html: typeof html;
        mixin: typeof mixin;
        pair: typeof pair;
        parse: typeof parse;
        range: typeof range;
        shuffle: typeof shuffle;
        toggle: typeof toggle;
        uuid: typeof uuid;
        slowloop: typeof slowloop;
        dms: {
            parse: typeof dmsParse;
            fromDms: (dms: string) => {
                lon: number;
                lat: number;
            };
            fromLonLat: (o: {
                lon: number;
                lat: number;
            }) => string;
        };
        navigation: {
            zoomToFeature: typeof zoomToFeature;
        };
    };
    export = index;
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-cross" {
    import { Format } from "../@types/formats";
    export class Shapeshifter {
        static is(style: Format.Style): boolean;
        static as(style: Format.Style): Format.Style;
        static inverse(style: Format.Style): Format.Style;
    }
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-square" {
    import { Format } from "../@types/formats";
    export class Shapeshifter {
        static is(style: Format.Style): boolean;
        static as(style: Format.Style): Format.Style;
        static inverse(style: Format.Style): Format.Style;
    }
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-diamond" {
    import { Format } from "../@types/formats";
    export class Shapeshifter {
        static is(style: Format.Style): boolean;
        static as(style: Format.Style): Format.Style;
        static inverse(style: Format.Style): Format.Style;
    }
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-triangle" {
    import { Format } from "../@types/formats";
    export class Shapeshifter {
        static is(style: Format.Style): boolean;
        static as(style: Format.Style): Format.Style;
        static inverse(style: Format.Style): Format.Style;
    }
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-x" {
    import { Format } from "../@types/formats";
    export class Shapeshifter {
        static is(style: Format.Style): boolean;
        static as(style: Format.Style): Format.Style;
        static inverse(style: Format.Style): Format.Style;
    }
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer" {
    import ol = require("openlayers");
    import Serializer = require("./@types/base");
    import { Format } from "./@types/formats";
    export class StyleConverter implements Serializer.IConverter<Format.Style> {
        private converters;
        constructor();
        fromJson(json: Format.Style): ol.style.Style;
        toJson(style: ol.style.Style): Format.Style;
        getGeometry(feature: ol.Feature | ol.render.Feature): ol.geom.Geometry | ol.render.Feature;
        private serializeStyle;
        private serializeImage;
        private serializeStroke;
        private serializeText;
        private serializeColor;
        private serializeFill;
        private deserializeStyle;
        private deserializeText;
        private deserializeCircle;
        private deserializeStar;
        private deserializeIcon;
        private deserializeSvg;
        private deserializeFill;
        private deserializeStroke;
        private deserializeColor;
        private deserializeLinearGradient;
        private deserializeRadialGradient;
    }
}
declare module "node_modules/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer" {
    import { ArcGisFeatureServerLayer } from "./@types/ArcGisFeatureServerLayer";
    export class StyleConverter {
        private asWidth;
        private asColor;
        private fromSFSSolid;
        private fromSFSForwardDiagonal;
        private fromSFSBackwardDiagonal;
        private fromSFS;
        private fromSMSCircle;
        private fromSMSCross;
        private fromSMSDiamond;
        private fromSMSPath;
        private fromSMSSquare;
        private fromSMSX;
        private fromSMS;
        private fromPMS;
        private fromSLSSolid;
        private fromSLS;
        private fromPFS;
        private fromTS;
        fromJson(symbol: ArcGisFeatureServerLayer.Symbol): import("openlayers").style.Style;
        private fromSymbol;
        fromRenderer(renderer: ArcGisFeatureServerLayer.Renderer, args: {
            url: string;
        }): import("openlayers").style.Style | ((feature: import("openlayers").Feature) => import("openlayers").style.Style);
    }
}
declare module "node_modules/ol3-symbolizer/index" {
    import Symbolizer = require("node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer");
    import { StyleConverter as AgsStyleConverter } from "node_modules/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer";
    import { StyleConverter } from "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer";
    import { Format } from "./ol3-symbolizer/format/@types/formats";
    export { Symbolizer, AgsStyleConverter, StyleConverter, Format };
}
declare module "ol3-popup/commands/smartpick" {
    import { IPopup } from "../@types/popup";
    export function smartpick(popup: IPopup, targetPosition?: ol.Coordinate, threshold?: number): import("openlayers").OverlayPositioning;
}
declare module "ol3-popup/ol3-popup" {
    import ol = require("openlayers");
    import { Paging } from "ol3-popup/paging/paging";
    import { IPopup } from "./@types/popup";
    import { PopupOptions } from "./@types/popup-options";
    export const TRIANGLES: {
        "bottom-left": string;
        "bottom-center": string;
        "bottom-right": string;
        "center-left": string;
        "center-center": string;
        "center-right": string;
        "top-left": string;
        "top-center": string;
        "top-right": string;
    };
    export const DIAMONDS: {
        "bottom-left": string;
        "bottom-center": string;
        "bottom-right": string;
        "center-left": string;
        "center-center": string;
        "center-right": string;
        "top-left": string;
        "top-center": string;
        "top-right": string;
    };
    export const DEFAULT_OPTIONS: PopupOptions;
    export class Popup extends ol.Overlay implements IPopup {
        options: PopupOptions & {
            parentNode?: HTMLElement;
        };
        content: HTMLDivElement;
        domNode: HTMLDivElement;
        private element;
        private closer;
        private docker;
        pages: Paging;
        private handlers;
        static create(options?: PopupOptions): IPopup;
        private constructor();
        private configureDom;
        private configureContentContainer;
        private configureDockerButton;
        private configureCloserButton;
        private configurePaging;
        private configureAutoPopup;
        private injectCss;
        indicator: ol.Overlay;
        private hideIndicator;
        private showIndicator;
        private positionIndicator;
        setPosition(position: ol.Coordinate): void;
        panIntoView(): void;
        destroy(): void;
        show(coord: ol.Coordinate, html?: string | HTMLElement): this;
        on(type: "change:active", listener: () => void): ol.EventsKey;
        on(type: "dock", listener: () => void): ol.EventsKey;
        on(type: "undock", listener: () => void): ol.EventsKey;
        on(type: "hide", listener: () => void): ol.EventsKey;
        on(type: "show", listener: () => void): ol.EventsKey;
        on(type: "dispose", listener: () => void): ol.EventsKey;
        hide(): this;
        isOpened(): boolean;
        isDocked(): boolean;
        dock(): this;
        undock(): this;
        applyOffset([x, y]: number[]): void;
    }
}
declare module "index" {
    import { Popup, DEFAULT_OPTIONS, DIAMONDS, TRIANGLES } from "ol3-popup/ol3-popup";
    import { IPopup } from "./ol3-popup/@types/popup";
    import { PopupOptions } from "./ol3-popup/@types/popup-options";
    export { Popup, DEFAULT_OPTIONS, IPopup, PopupOptions, DIAMONDS, TRIANGLES };
}
