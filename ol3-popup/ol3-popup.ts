/**
 * OpenLayers 3 Popup Overlay.
 */
import $ = require("jquery");
import ol = require("openlayers");
import { Paging } from "./paging/paging";
import PageNavigator = require("./paging/page-navigator");

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

/**
 * extends the base object without replacing defined attributes
 */
function defaults<A, B>(a: A, ...b: B[]): A & B {
    b.forEach(b => {
        Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
    });
    return <A & B>a;
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
export interface IPopupOptions_2_0_4 extends olx.OverlayOptions {
    // calls panIntoView when position changes
    autoPan?: boolean;
    // when panning into view, passed to the pan animation to track the 'center'
    autoPanAnimation?: {
        // how long should the animation last?
        duration: number;
        source: any;
    };
    // virtually increases the control width & height by this amount when computing new center point
    autoPanMargin?: number;
    // determines if this should be the first (or last) element in its container
    insertFirst?: boolean;
    // determines which container to use, if true then event propagation is stopped meaning mousedown and touchstart events don't reach the map.
    stopEvent?: boolean;
    // the pixel offset when computing the rendered position
    offset?: number[];
    // one of (bottom|center|top)*(left|center|right), css positioning when updating the rendered position
    positioning?: string;
    // the point coordinate for this overlay
    position?: [number, number];
};

export interface IPopupOptions_2_0_5 extends IPopupOptions_2_0_4 {
    dockContainer?: JQuery | string | HTMLElement;
}

export interface IPopupOptions_2_0_6 extends IPopupOptions_2_0_5 {
    css?: string; // css file
    pointerPosition?: number;
}

export interface IPopupOptions_2_0_7 extends IPopupOptions_2_0_6 {
    xOffset?: number;
    yOffset?: number;
}

export interface IPopupOptions extends IPopupOptions_2_0_7 {
}

/**
 * Default options for the popup control so it can be created without any contructor arguments
 */
const DEFAULT_OPTIONS: IPopupOptions = {
    // determines if this should be the first (or last) element in its container
    insertFirst: true,
    autoPan: true,
    autoPanAnimation: {
        source: null,
        duration: 250
    },
    pointerPosition: 50,
    xOffset: 0,
    yOffset: 0,
    positioning: "top-right", // ol.OverlayPositioning.TOP_RIGHT
    stopEvent: true
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
    options: IPopupOptions & { map?: ol.Map, parentNode?: HTMLElement };
    content: HTMLDivElement;
    domNode: HTMLDivElement;
    private closer: HTMLLabelElement;
    private docker: HTMLLabelElement;
    pages: Paging;

    private handlers: Array<() => void>;

    constructor(options = DEFAULT_OPTIONS) {

        options = defaults({}, options, DEFAULT_OPTIONS);
        /**
         * overlays have a map, element, offset, position, positioning
         */
        super(options);
        this.options = options;
        this.handlers = [];

        // the internal properties, dom and listeners are in place, time to create the popup
        this.postCreate();
    }


    private postCreate() {

        this.injectCss(css);
        let options = this.options;
        options.css && this.injectCss(options.css);

        let domNode = this.domNode = document.createElement('div');
        domNode.className = classNames.olPopup;
        this.setElement(domNode);

        if (this.options.pointerPosition) {
            this.setIndicatorPosition(this.options.pointerPosition);
        }

        if (this.options.dockContainer) {
            let dockContainer = $(this.options.dockContainer)[0];
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

        if (0) {
            let callback = this.setPosition;
            this.setPosition = debounce(args => callback.apply(this, args), 50);
        }

    }

    private injectCss(css: string) {
        let style = $(`<style type='text/css'>${css}</style>`);
        style.appendTo('head');
        this.handlers.push(() => style.remove());
    }

    private setIndicatorPosition(x: number) {
        let css = `
.ol-popup { position: absolute; bottom: ${this.options.yOffset + 12}px; left: ${this.options.xOffset - x}px; }
.ol-popup:after { bottom: -20px; left: ${x}px; }
`;

        this.injectCss(css);
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
        this.dispose();
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
        $(this.options.dockContainer).append(this.domNode);
    }

    undock() {
        this.options.parentNode.appendChild(this.domNode);
        this.domNode.classList.remove(classNames.docked);
        this.options.map.addOverlay(this);
        this.setPosition(this.options.position);
    }

}
