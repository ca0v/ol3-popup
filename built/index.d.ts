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
        offset?: number[];
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
    export interface IPopupOptions extends IPopupOptions_2_0_7 {
    }
    /**
     * This is the contract that will not break between versions
     */
    export interface IPopup_2_0_4<T> {
        show(position: ol.Coordinate, markup: string): T;
        hide(): T;
    }
    export interface IPopup_2_0_5<T> extends IPopup_2_0_4<Popup> {
        isOpened(): boolean;
        destroy(): void;
        panIntoView(): void;
        isDocked(): boolean;
    }
    export interface IPopup extends IPopup_2_0_5<Popup> {
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
        private setIndicatorPosition(x);
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
declare module "ol3-popup/examples/style-offset" {
    export function run(): void;
}
