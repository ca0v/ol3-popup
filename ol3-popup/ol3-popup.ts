/**
 * OpenLayers 3 Popup Overlay.
 */
import ol = require("openlayers");
import { Paging } from "./paging/paging";
import { default as PageNavigator } from "./paging/page-navigator";
import { cssin, defaults, html } from "ol3-fun/ol3-fun/common";
import { SelectInteraction } from "./interaction";
import Symbolizer = require("ol3-symbolizer");

const symbolizer = new Symbolizer.StyleConverter();

const css = `
.ol-popup {
    position: absolute;
    bottom: 12px;
    left: -50px;
}

.ol-popup:after {
    top: auto;
    bottom: -20px;
    left: 50px;
    border: solid transparent;
    border-top-color: inherit;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-width: 10px;
    margin-left: -10px;
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

const classNames = {
    olPopup: 'ol-popup',
    olPopupDocker: 'ol-popup-docker',
    olPopupCloser: 'ol-popup-closer',
    olPopupContent: 'ol-popup-content',
    hidden: 'hidden',
    docked: 'docked'
};

const eventNames = {
    show: "show",
    hide: "hide"
};

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
    let baseStyle = symbolizer.fromJson({
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
 * debounce: wait until it hasn't been called for a while before executing the callback
 */
function debounce<T extends Function>(func: T, wait = 20, immediate = false): T {
    let timeout;
    return <T><any>((...args: any[]) => {
        let later = () => {
            timeout = null;
            if (!immediate) func.call(this, args);
        };
        let callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.call(this, args);
    });
}

let isTouchDevice = () => {
    try {
        document.createEvent("TouchEvent");
        isTouchDevice = () => true;
    } catch (e) {
        isTouchDevice = () => false;
    }
    return isTouchDevice();
};

/**
 * Apply workaround to enable scrolling of overflowing content within an
 * element. Adapted from https://gist.github.com/chrismbarr/4107472
 */
function enableTouchScroll(elm: HTMLElement) {
    var scrollStartPos = 0;
    elm.addEventListener("touchstart", function (event) {
        scrollStartPos = this.scrollTop + event.touches[0].pageY;
    }, false);
    elm.addEventListener("touchmove", function (event) {
        this.scrollTop = scrollStartPos - event.touches[0].pageY;
    }, false);
}

/**
 * The constructor options 'must' conform, most interesting is autoPan
 */
export interface IPopupOptions extends olx.OverlayOptions {
    map: ol.Map,
    // allow multiple popups or automatically close before re-opening?
    multi?: boolean;
    // automatically listen for map click event and open popup
    autoPopup?: boolean;
    // allows popup to dock w/in this container
    dockContainer?: HTMLElement;
    // css content to add to DOM for the lifecycle of this control
    css?: string;
    // where should the infoviewer callout be placed relative to the edge?
    pointerPosition?: number;
    // indicator position
    xOffset?: number;
    // indicator position
    yOffset?: number;
    // how to style paged features
    pagingStyle?: (feature: ol.Feature, resolution: number, page: number) => ol.style.Style[];
    // how to render a feature
    asContent?: (feature: ol.Feature) => HTMLElement;
}

/**
 * Default options for the popup control so it can be created without any contructor arguments
 */
const DEFAULT_OPTIONS: IPopupOptions = {
    asContent: asContent,
    multi: false,
    autoPan: true,
    autoPanAnimation: {
        source: null,
        duration: 250
    },
    autoPopup: true,
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
    xOffset: 0,
    yOffset: 0,
    positioning: "top-right", // ol.OverlayPositioning.TOP_RIGHT
    stopEvent: true
}

/**
 * This is the contract that will not break between versions
 */
export interface IPopup_4_0_1<T> {
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
    setPointerPosition(offset: number);
}

export interface IPopup extends IPopup_4_0_1<Popup> {
}

/**
 * The control formerly known as ol.Overlay.Popup 
 */
export class Popup extends ol.Overlay implements IPopup {
    options: IPopupOptions & { parentNode?: HTMLElement };
    content: HTMLDivElement;
    domNode: HTMLDivElement;
    private closer: HTMLLabelElement;
    private docker: HTMLLabelElement;
    pages: Paging;

    private handlers: Array<() => void>;

    static create(options: IPopupOptions) {
        options = defaults({}, options, DEFAULT_OPTIONS);

        let popup = new Popup(options);
        options.map && options.map.addOverlay(popup);
        return popup;
    }

    private constructor(options: IPopupOptions) {
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
        options.css && this.injectCss(options.css);

        let domNode = this.domNode = document.createElement('div');
        domNode.className = classNames.olPopup;
        this.setElement(domNode);

        if (typeof this.options.pointerPosition === "number") {
            this.setPointerPosition(this.options.pointerPosition);
        }

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
            // Apply workaround to enable scrolling of content div on touch devices
            isTouchDevice() && enableTouchScroll(content);
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
            this.handlers.push(() => autoPopup.destroy());
        }

    }

    private injectCss(css: string) {
        let style = html(`<style type='text/css'>${css}</style>`);
        document.head.appendChild(style);
        this.handlers.push(() => style.remove());
    }

    setIndictorPosition() {
        throw "removed in 4.0.1: use setPointerPosition";
    }

    setPointerPosition(offset: number) {
        // "bottom-left" | "bottom-center" | "bottom-right" | "center-left" | "center-center" | "center-right" | "top-left" | "top-center" | "top-right"
        let [verticalPosition, horizontalPosition] = this.getPositioning().split("-", 2);

        let css = <string[]>[];
        switch (verticalPosition) {
            case "bottom":
                css.push(`.ol-popup { top: ${10 + this.options.yOffset}px; bottom: auto; }`);
                css.push(`.ol-popup:after {  top: -20px; bottom: auto; transform: rotate(180deg);}`);
                break;
            case "center":
                break;
            case "top":
                css.push(`.ol-popup { top: auto; bottom: ${10 + this.options.yOffset}px; }`);
                css.push(`.ol-popup:after {  top: auto; bottom: -20px; transform: rotate(0deg);}`);
                break;
        }

        switch (horizontalPosition) {
            case "center":
                break;
            case "left":
                css.push(`.ol-popup { left: auto; right: ${this.options.xOffset - offset - 10}px; }`);
                css.push(`.ol-popup:after { left: auto; right: ${offset}px; }`);
                break;
            case "right":
                css.push(`.ol-popup { left: ${this.options.xOffset - offset - 10}px; right: auto; }`);
                css.push(`.ol-popup:after { left: ${10 + offset}px; right: auto; }`);
                break;
        }

        css.forEach(css => this.injectCss(css));
    }

    setPosition(position: ol.Coordinate) {
        this.options.position = <any>position;
        if (!this.isDocked()) {
            super.setPosition(position);
        } else {
            let view = this.options.map.getView();
            view.animate({
                center: position
            });

        }
    }

    panIntoView() {
        if (!this.isOpened()) return;
        if (this.isDocked()) return;
        let p = this.getPosition();
        p && this.setPosition(p.map(v => v)); // clone p to force change
    }

    destroy() {
        this.handlers.forEach(h => h());
        this.handlers = [];
        this.getMap().removeOverlay(this);
        this.dispatch("dispose");
    }

    dispatch(name: string) {
        this["dispatchEvent"](new Event(name));
    }

    show(coord: ol.Coordinate, html: string | HTMLElement) {

        if (html instanceof HTMLElement) {
            this.content.innerHTML = "";
            this.content.appendChild(html);
        } else {
            this.content.innerHTML = html;
        }
        this.domNode.classList.remove(classNames.hidden);

        this.setPosition(coord);

        this.dispatch(eventNames.show);

        return this;
    }

    hide() {
        this.isDocked() && this.undock();
        this.setPosition(undefined);
        this.pages.clear();
        this.dispatch(eventNames.hide);
        this.domNode.classList.add(classNames.hidden);
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
    }

    undock() {
        this.options.parentNode.appendChild(this.domNode);
        this.domNode.classList.remove(classNames.docked);
        this.options.map.addOverlay(this);
        this.setPosition(this.options.position);
    }

    applyOffset([x, y]: [number, number]) {
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
