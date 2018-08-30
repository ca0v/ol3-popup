/**
 * OpenLayers 3 Popup Overlay.
 */
import $ = require("jquery");
import ol = require("openlayers");
import { olx } from "openlayers";
import { Paging } from "./paging/paging";
import { default as PageNavigator } from "./paging/page-navigator";
import { cssin, defaults, html } from "ol3-fun/ol3-fun/common";
import { SelectInteraction } from "./interaction";
import Symbolizer = require("ol3-symbolizer/index");

const symbolizer = new Symbolizer.Symbolizer.StyleConverter();

const css = `
.ol-popup {
}

.ol-popup.hidden {
    display: none;
}

.ol-popup.docked {
    position:absolute;
    bottom:0;
    top:0;
    left:0;
    right:0;
    width:auto;
    height:auto;
    pointer-events: all;
}

.ol-popup.docked:after {
    display:none;
}

.ol-popup.docked .pages {
    max-height: inherit;
    overflow: auto;
    height: calc(100% - 60px);
}

.ol-popup.docked .pagination {
    position: absolute;
    bottom: 0;
}

.ol-popup .pagination .btn-prev::after {
    content: "⇦"; 
}

.ol-popup .pagination .btn-next::after {
    content: "⇨"; 
}

.ol-popup .pagination.hidden {
    display: none;
}

.ol-popup .ol-popup-closer {
    border: none;
    background: transparent;
    color: inherit;
    position: absolute;
    top: 0;
    right: 0;
    text-decoration: none;
}
    
.ol-popup .ol-popup-closer:after {
    content:'✖';
}

.ol-popup .ol-popup-docker {
    border: none;
    background: transparent;
    color: inherit;
    text-decoration: none;
    position: absolute;
    top: 0;
    right: 20px;
}

.ol-popup .ol-popup-docker:after {
    content:'□';
}
`;

const baseStyle = symbolizer.fromJson({
    "circle": {
        "fill": {
            "color": "rgba(255,0,0,1)"
        },
        "opacity": 1,
        "stroke": {
            "color": "rgba(255,255,255,1)",
            "width": 1
        },
        "radius": 3
    }
});

const classNames = {
    olPopup: 'ol-popup',
    olPopupDocker: 'ol-popup-docker',
    olPopupCloser: 'ol-popup-closer',
    olPopupContent: 'ol-popup-content',
    hidden: 'hidden',
    docked: 'docked'
};

const eventNames = {
    dispose: "dispose",
    dock: "dock",
    hide: "hide",
    show: "show",
    undock: "undock"
};

function arrayEqual<T>(a: T[], b: T[]) {
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((v, i) => v == b[i]);
}

function asContent(feature: ol.Feature) {
    let div = document.createElement("div");

    let keys = Object.keys(feature.getProperties()).filter(key => {
        let v = feature.get(key);
        if (typeof v === "string") return true;
        if (typeof v === "number") return true;
        return false;
    });
    div.title = feature.getGeometryName();
    div.innerHTML = `<table>${keys.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`).join("")}</table>`;

    return div;
}

function pagingStyleFactory(popup: Popup) {
    return (feature: ol.Feature, resolution: number, pageIndex: number) => {
        let style = [baseStyle];

        if (popup.options.multi && popup.pages.count > 1) {
            let isActive = popup.pages.activeIndex === pageIndex;

            let textStyle = symbolizer.fromJson({

                text: {
                    text: `${pageIndex + 1}`,
                    fill: {
                        color: isActive ? "white" : "black",
                    },
                    stroke: {
                        color: isActive ? "black" : "white",
                        width: isActive ? 4 : 2
                    },
                    "offset-y": 20
                }
            });

            style.push(textStyle);
        }

        return style;
    };
}

/**
 * The constructor options 'must' conform, most interesting is autoPan
 */
export interface PopupOptions extends olx.OverlayOptions {
    map: ol.Map,
    // allow multiple popups or automatically close before re-opening?
    multi?: boolean;
    // automatically listen for map click event and open popup
    autoPopup?: boolean;
    // allows popup to dock w/in this container
    dockContainer?: HTMLElement;
    // facilitates styling by adding a class name
    className?: string;
    // css content to add to DOM for the lifecycle of this control
    css?: string;
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

/**
 * Default options for the popup control so it can be created without any contructor arguments
 */
const DEFAULT_OPTIONS: PopupOptions = {
    map: null,
    asContent: asContent,
    multi: false,
    autoPan: true,
    autoPanAnimation: {
        source: null,
        duration: 250
    },
    autoPopup: true,
    className: classNames.olPopup,
    css: `
.ol-popup {
    background-color: white;
    border: 1px solid black;
    padding: 4px;
    padding-top: 24px;
}
.ol-popup .ol-popup-content {
    overflow: auto;
    min-width: 120px;
    max-width: 360px;
    max-height: 240px;
}
.ol-popup .pages {
    overflow: auto;
    max-width: 360px;
    max-height: 240px;
}
.ol-popup .ol-popup-closer {
    right: 4px;
}
`.trim(),
    // determines if this should be the first (or last) element in its container
    insertFirst: true,
    pointerPosition: 50,
    offset: [0, -10],
    positioning: "bottom-center",
    stopEvent: true,
    showCoordinates: false
}

/**
 * This is the contract that will not break between versions
 */
export interface IPopup_4_0_1<T> extends ol.Overlay {
    // show popup at this coordinate
    show(position: ol.Coordinate, markup: string): T;
    // close popup
    hide(): T;
    // true when open
    isOpened(): boolean;
    // destroy and cleanup
    destroy(): void;
    // pan map so infoviewer is fully within view
    panIntoView(): void;
    // true when docked
    isDocked(): boolean;
    // changes the infoViewer relative to actual target location (pixels)
    applyOffset([x, y]: [number, number]);
    // sets the pointer position
    setPointerPosition(number?);
}

export interface IPopup extends IPopup_4_0_1<Popup> {
}

/**
 * The control formerly known as ol.Overlay.Popup 
 */
export class Popup extends ol.Overlay implements IPopup {
    options: PopupOptions & { parentNode?: HTMLElement };
    content: HTMLDivElement;
    domNode: HTMLDivElement;
    private closer: HTMLLabelElement;
    private docker: HTMLLabelElement;
    pages: Paging;

    private handlers: Array<() => void>;

    static create(options: PopupOptions) {
        options = defaults({}, options, DEFAULT_OPTIONS);

        let popup = new Popup(options);
        options.map && options.map.addOverlay(popup);
        return popup;
    }

    private constructor(options: PopupOptions) {
        /**
         * overlays have a map, element, offset, position, positioning
         */
        super(options);
        if (!options.pagingStyle) {
            options.pagingStyle = pagingStyleFactory(this);
        }

        this.options = options;
        this.handlers = [];


        cssin("ol3-popup", css);
        options.css && this.injectCss("options", options.css);

        let domNode = this.domNode = document.createElement('div');
        domNode.className = "popup-element";
        this.setElement(domNode);
        this.handlers.push(() => domNode.remove());

        if (this.options.dockContainer) {
            let dockContainer = this.options.dockContainer;
            if (dockContainer) {
                let docker = this.docker = document.createElement('label');
                docker.className = classNames.olPopupDocker;
                domNode.appendChild(docker);

                docker.addEventListener('click', evt => {
                    this.isDocked() ? this.undock() : this.dock();
                    evt.preventDefault();
                }, false);
            }
        }

        {
            let closer = this.closer = document.createElement('label');
            closer.className = classNames.olPopupCloser;
            domNode.appendChild(closer);

            closer.addEventListener('click', evt => {
                this.hide();
                evt.preventDefault();
            }, false);
        }

        {
            let content = this.content = document.createElement('div');
            content.className = classNames.olPopupContent;
            this.domNode.appendChild(content);
        }

        {
            let pages = this.pages = new Paging({ popup: this });
            let pageNavigator = new PageNavigator({ pages: pages });
            pageNavigator.hide();
            pageNavigator.on("prev", () => pages.prev());
            pageNavigator.on("next", () => pages.next());
            pages.on("goto", () => this.panIntoView());
        }

        if (this.options.autoPopup) {
            let autoPopup = SelectInteraction.create({
                popup: this
            });
            this.on("change:active", () => {
                autoPopup.set("active", this.get("active"));
            });
            this.handlers.push(() => autoPopup.destroy());
        }

    }

    private injectCss(id: string, css: string) {
        id = this.getId() + "_" + id;
        let style = document.getElementById(id) as HTMLStyleElement;
        if (style) style.remove();
        style = html(`<style type='text/css' id='${id}'>${css}</style>`) as HTMLStyleElement;
        $(document.head).append(style);
        this.handlers.push(() => style.remove());
    }

    private indicator: ol.Overlay;

    setPointerPosition(offset = this.options.pointerPosition || 0) {
        // "bottom-left" | "bottom-center" | "bottom-right" | "center-left" | "center-center" | "center-right" | "top-left" | "top-center" | "top-right"
        let [verticalPosition, horizontalPosition] = this.getPositioning().split("-", 2);

        let overlay = this.indicator;
        if (!overlay) {
            overlay = this.indicator = new ol.Overlay({
                element: html(`<span class="simple-popup-down-arrow"></span>`),
            });
            this.options.map.addOverlay(overlay);
        }

        overlay.setPositioning(this.getPositioning());
        overlay.setPosition(this.getPosition());

        switch (verticalPosition) {
            case "top":
                {
                    overlay.setElement(html(`<span class="simple-popup-up-arrow"></span>`));
                    overlay.setOffset([0, 0 + offset]);
                    overlay.setPositioning("top-center");
                    switch (horizontalPosition) {
                        case "center":
                            this.setOffset([0, 8 + offset]);
                            break;
                        case "left":
                            this.setOffset([-7, 8 + offset]);
                            break;
                        case "right":
                            this.setOffset([7, 8 + offset]);
                            break;
                    }
                }
                break;
            case "bottom":
                {
                    overlay.setElement(html(`<span class="simple-popup-down-arrow"></span>`));
                    overlay.setOffset([0, 0 - offset]);
                    overlay.setPositioning("bottom-center");
                    let dx = 7;
                    let dy = -10 - offset;                    
                    switch (horizontalPosition) {
                        case "center":
                            this.setOffset([0, dy]);
                            break;
                        case "left":
                            this.setOffset([-dx, dy]);
                            break;
                        case "right":
                            this.setOffset([dx, dy]);
                            break;
                    }
                }
                break;

            case "center":
                switch (horizontalPosition) {
                    case "center":
                        overlay.setPosition(null);
                        break;
                    case "left":
                        overlay.setElement(html(`<span class="simple-popup-left-arrow"></span>`));
                        overlay.setOffset([offset, 0]);
                        overlay.setPositioning("center-left");
                        this.setOffset([5 + offset, 0]);
                        break;
                    case "right":
                        overlay.setElement(html(`<span class="simple-popup-right-arrow"></span>`));
                        overlay.setOffset([-offset, 0]);
                        overlay.setPositioning("center-right");
                        this.setOffset([-5 - offset, 0]);
                        break;
                }
                break;
            default:
                throw `unknown value: ${verticalPosition}`;
        }

        switch (horizontalPosition) {
            case "center":
                break;
            case "left":
                break;
            case "right":
                break;
            default:
                throw `unknown value: ${verticalPosition}`;
        }


    }

    setPosition(position: ol.Coordinate) {
        // make popup visible
        this.options.position = <any>position;
        if (!this.isDocked()) {
            // ol cannot determine if the position changes so triggers that it has changed creating a circular callback
            !arrayEqual(this.getPosition(), position) && super.setPosition(position);
        } else {
            // move map to this position
            let view = this.options.map.getView();
            view.animate({
                center: position
            });
        }

        this.setPointerPosition(this.options.pointerPosition);
    }

    panIntoView() {
        if (!this.isOpened()) return;
        if (this.isDocked()) return;
        let p = this.getPosition();
        p && this.setPosition(p.map(v => v) as [number, number]); // clone p to force change
    }

    destroy() {
        this.handlers.forEach(h => h());
        this.handlers = [];
        this.getMap() && this.getMap().removeOverlay(this);
        this.dispatchEvent(eventNames.dispose);
    }

    show(coord: ol.Coordinate, html: string | HTMLElement) {

        if (html instanceof HTMLElement) {
            this.content.innerHTML = "";
            this.content.appendChild(html);
        } else {
            this.content.innerHTML = html;
        }
        this.setPosition(coord);

        this.domNode.classList.remove(classNames.hidden);
        this.dispatchEvent(eventNames.show);

        return this;
    }

    on(type: "change:active", listener: () => void): ol.EventsKey;
    on(type: "dock", listener: () => void): ol.EventsKey;
    on(type: "undock", listener: () => void): ol.EventsKey;
    on(type: "hide", listener: () => void): ol.EventsKey;
    on(type: "show", listener: () => void): ol.EventsKey;
    on(type: "dispose", listener: () => void): ol.EventsKey;
    on(type: (string | string[]), listener: () => void): (ol.EventsKey | ol.EventsKey[]) {
        return super.on(type, listener);
    }

    hide() {
        this.setPosition(undefined);
        this.pages.clear();
        this.domNode.classList.add(classNames.hidden);
        this.dispatchEvent(eventNames.hide);
        return this;
    }

    isOpened() {
        return !this.domNode.classList.contains(classNames.hidden);
    }

    isDocked() {
        return this.domNode.classList.contains(classNames.docked);
    }

    dock() {
        let map = this.getMap();
        this.options.map = map;
        this.options.parentNode = this.domNode.parentElement;

        map.removeOverlay(this);
        this.domNode.classList.add(classNames.docked);
        this.options.dockContainer.appendChild(this.domNode);
        this.dispatchEvent(eventNames.dock);
        return this;
    }

    undock() {
        this.options.parentNode.appendChild(this.domNode);
        this.domNode.classList.remove(classNames.docked);
        this.options.map.addOverlay(this);
        this.setPosition(this.options.position);
        this.dispatchEvent(eventNames.undock);
        return this;
    }

    applyOffset([x, y]: number[]) {
        switch (this.getPositioning()) {
            case "bottom-left":
                this.setOffset([x, -y]);
                break;
            case "bottom-right":
                this.setOffset([-x, -y]);
                break;
            case "top-left":
                this.setOffset([x, y]);
                break;
            case "top-right":
                this.setOffset([-x, y]);
                break;
        }
    }
}
