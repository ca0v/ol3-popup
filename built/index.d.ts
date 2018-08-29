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
        on(name: string, listener: () => void): any;
        on(name: "add", listener: (evt: {
            pageIndex: number;
            feature: ol.Feature;
            element: HTMLElement;
            geom: ol.geom.Geometry;
        }) => void): any;
        on(name: "clear", listener: () => void): any;
        on(name: "goto", listener: () => void): any;
        on(name: "remove", listener: (evt: {
            pageIndex: number;
            feature: ol.Feature;
            element: HTMLElement;
            geom: ol.geom.Geometry;
        }) => void): any;
        private findPage;
        private removePage;
        addFeature(feature: ol.Feature, options: {
            searchCoordinate: ol.Coordinate;
        }): IPage;
        add(source: SourceType | SourceCallback, geom?: ol.geom.Geometry): IPage;
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
    export class PageNavigator extends ol.Observable {
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
    export function asArray<T extends HTMLInputElement>(list: NodeList): T[];
    export function toggle(e: HTMLElement, className: string, toggle?: boolean): void;
    export function parse<T>(v: string, type: T): T;
    export function getQueryParameters(options: any, url?: string): void;
    export function getParameterByName(name: string, url?: string): string;
    export function doif<T>(v: T, cb: (v: T) => void): void;
    export function mixin<A extends any, B extends any>(a: A, b: B): A & B;
    export function defaults<A extends any, B extends any>(a: A, ...b: B[]): A & B;
    export function cssin(name: string, css: string): () => void;
    export function debounce<T extends Function>(func: T, wait?: number, immediate?: boolean): T;
    export function html(html: string): HTMLElement;
    export function pair<A, B>(a1: A[], a2: B[]): [A, B][];
    export function range(n: number): any[];
    export function shuffle<T>(array: T[]): T[];
}
declare module "ol3-popup/interaction" {
    import ol = require("openlayers");
    import { olx } from "openlayers";
    import { Popup } from "ol3-popup/ol3-popup";
    export interface SelectOptions extends olx.interaction.SelectOptions {
        map?: ol.Map;
        popup?: Popup;
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
declare module "node_modules/ol3-symbolizer/index" {
    import * as Symbolizer from "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer";
    import { Format } from "./ol3-symbolizer/format/@types/formats";
    export { Symbolizer, Format };
}
declare module "ol3-popup/ol3-popup" {
    import ol = require("openlayers");
    import { olx } from "openlayers";
    import { Paging } from "ol3-popup/paging/paging";
    export interface PopupOptions extends olx.OverlayOptions {
        map: ol.Map;
        multi?: boolean;
        autoPopup?: boolean;
        dockContainer?: HTMLElement;
        className?: string;
        css?: string;
        pointerPosition?: number;
        xOffset?: number;
        yOffset?: number;
        pagingStyle?: (feature: ol.Feature, resolution: number, page: number) => ol.style.Style[];
        asContent?: (feature: ol.Feature) => HTMLElement;
        layers?: ol.layer.Vector[];
        showCoordinates?: boolean;
    }
    export interface IPopup_4_0_1<T> extends ol.Overlay {
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
        options: PopupOptions & {
            parentNode?: HTMLElement;
        };
        content: HTMLDivElement;
        domNode: HTMLDivElement;
        private closer;
        private docker;
        pages: Paging;
        private handlers;
        static create(options: PopupOptions): Popup;
        private constructor();
        private injectCss;
        setIndictorPosition(): void;
        setPointerPosition(offset: number): void;
        setPosition(position: ol.Coordinate): void;
        panIntoView(): void;
        destroy(): void;
        show(coord: ol.Coordinate, html: string | HTMLElement): this;
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
    import Popup = require("ol3-popup/ol3-popup");
    export = Popup;
}
