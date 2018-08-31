/**
 * OpenLayers 3 Popup Overlay.
 */
import $ = require("jquery");
import ol = require("openlayers");
import { Paging } from "./paging/paging";
import { default as PageNavigator } from "./paging/page-navigator";
import { cssin, defaults, html } from "ol3-fun/ol3-fun/common";
import { SelectInteraction } from "./interaction";
import Symbolizer = require("ol3-symbolizer/index");
import { IPopup } from "./@types/popup";
import { smartpick } from "./commands/smartpick";
import { PopupOptions } from "./@types/popup-options";
import { mixin } from "ol3-symbolizer/ol3-symbolizer/common/mixin";

const symbolizer = new Symbolizer.Symbolizer.StyleConverter();

const css = `
.ol-popup {
}

.ol-popup.hidden {
    display: none;
}

.ol-popup-element.docked {
    position:absolute;
    bottom:0;
    top:0;
    left:0;
    right:0;
    width:auto;
    height:auto;
    pointer-events: all;
}

.ol-popup-element.docked:after {
    display:none;
}

.ol-popup-element.docked .pages {
    max-height: inherit;
    overflow: auto;
    height: calc(100% - 60px);
}

.ol-popup-element.docked .pagination {
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

.ol-popup-element .pagination .btn-prev::after {
    content: "⇦"; 
}

.ol-popup-element .pagination .btn-next::after {
    content: "⇨"; 
}

.ol-popup-element .pagination.hidden {
    display: none;
}

.ol-popup-element .ol-popup-closer {
    border: none;
    background: transparent;
    color: inherit;
    position: absolute;
    top: 0;
    right: 0;
    text-decoration: none;
}
    
.ol-popup-element .ol-popup-closer:after {
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

.simple-popup {
    border: 1px solid black;
    border-radius: 4px;
    padding: 10px;
    background-color: rgba(80, 80, 80, 0.5);
    color: rgb(250, 250, 250);
    max-width: 120px;
}

.simple-popup-down-arrow {
    color: black;
    font-size: 20px;
}

.simple-popup-down-arrow:after {
    content: "⇩";
}

.simple-popup-up-arrow {
    color: black;
    font-size: 20px;
}

.simple-popup-up-arrow:after {
    content: "⇧";
}

.simple-popup-left-arrow {
    color: black;
    font-size: 20px;
}

.simple-popup-left-arrow:after {
    content: "⇦";
}

.simple-popup-right-arrow {
    color: black;
    font-size: 20px;
}

.simple-popup-right-arrow:after {
    content: "⇨";
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
    olPopupElement: 'ol-popup-element',
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
 * Default options for the popup control so it can be created without any contructor arguments
 */
const DEFAULT_OPTIONS: PopupOptions = {
    map: null,
    asContent: asContent,
    multi: false,
    autoPan: true,
    autoPopup: true,
    autoPanMargin: 20,
    autoPositioning: true,
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
    pointerPosition: 20,
    offset: [0, -10],
    positioning: "bottom-center",
    stopEvent: true,
    showCoordinates: false
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

    /**
     * @param options Options to be applied to a newly created popup
     * @returns IPopup
     */
    static create(options: PopupOptions) {
        options = defaults({}, options, DEFAULT_OPTIONS);

        let popup = new Popup(options);
        options.map && options.map.addOverlay(popup);
        return popup as IPopup;
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

        this.configureDom(options);
        this.configureDockerButton(this.domNode);
        this.configureCloserButton(this.domNode);
        this.configureContentContainer();
        this.configurePaging();
        this.configureAutoPopup();
    }

    private configureDom(options: PopupOptions) {
        cssin("ol3-popup", css);
        options.css && this.injectCss("options", options.css);
        let domNode = this.domNode = document.createElement('div');
        domNode.className = classNames.olPopupElement;
        this.setElement(domNode);
        this.handlers.push(() => domNode.remove());
    }

    private configureContentContainer() {
        let content = this.content = document.createElement('div');
        content.className = classNames.olPopupContent;
        this.domNode.appendChild(content);
    }

    private configureDockerButton(domNode: HTMLDivElement) {
        if (!this.options.dockContainer) return;
        let docker = this.docker = document.createElement('label');
        docker.title = "docker";
        docker.className = classNames.olPopupDocker;
        domNode.appendChild(docker);
        docker.addEventListener('click', evt => {
            this.isDocked() ? this.undock() : this.dock();
            evt.preventDefault();
        }, false);
    }

    private configureCloserButton(domNode: HTMLDivElement) {
        let closer = this.closer = document.createElement('label');
        closer.title = "closer";
        closer.className = classNames.olPopupCloser;
        domNode.appendChild(closer);
        closer.addEventListener('click', evt => {
            this.isDocked() ? this.undock() : this.hide();
            evt.preventDefault();
        }, false);
    }

    private configurePaging() {
        let pages = this.pages = new Paging({ popup: this });
        let pageNavigator = new PageNavigator({ pages: pages });
        pageNavigator.hide();
        pageNavigator.on("prev", () => pages.prev());
        pageNavigator.on("next", () => pages.next());
        pages.on("goto", () => this.panIntoView());
    }

    private configureAutoPopup() {
        if (!this.options.autoPopup) return;
        let autoPopup = SelectInteraction.create({
            popup: this,
            buffer: 4 // symbology defect?  doesn't seem to find the markers unless you click left-of-center
        });
        this.on("change:active", () => {
            autoPopup.set("active", this.get("active"));
        });
        this.handlers.push(() => autoPopup.destroy());
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
    private hideIndicator() {
        this.indicator && this.indicator.setPosition(undefined);
    }

    private showIndicator() {
        let indicator = this.indicator;
        if (!indicator) {
            indicator = this.indicator = new ol.Overlay({
                autoPan: this.options.autoPan,
                autoPanMargin: this.options.autoPanMargin,
                autoPanAnimation: this.options.autoPanAnimation,
                element: html(`<span class="simple-popup-down-arrow"></span>`),
            });
            this.options.map.addOverlay(indicator);
        }

        indicator.setPositioning(this.getPositioning());
        indicator.setPosition(this.getPosition());
        return indicator;
    }

    private positionIndicator(offset = this.options.pointerPosition || 0) {
        if (!this.getPosition() && this.indicator) {
            this.hideIndicator();
            return;
        }

        let [verticalPosition, horizontalPosition] = this.getPositioning().split("-", 2);
        let indicator = this.showIndicator();

        switch (verticalPosition) {
            case "top":
                {
                    indicator.setElement(html(`<span class="simple-popup-up-arrow"></span>`));
                    indicator.setOffset([0, 0 + offset]);
                    indicator.setPositioning("top-center");
                    let [dx, dy] = [7, 8 + offset];
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
                        default:
                            throw `unknown value: ${horizontalPosition}`;
                    }
                }
                break;
            case "bottom":
                {
                    indicator.setElement(html(`<span class="simple-popup-down-arrow"></span>`));
                    indicator.setOffset([0, 0 - offset]);
                    indicator.setPositioning("bottom-center");
                    let [dx, dy] = [7, -(10 + offset)];
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
                        default:
                            throw `unknown value: ${horizontalPosition}`;
                    }
                }
                break;

            case "center":
                {
                    let [dx, dy] = [5 + offset, 0];
                    switch (horizontalPosition) {
                        case "center":
                            indicator.setPosition(null);
                            break;
                        case "left":
                            indicator.setElement(html(`<span class="simple-popup-left-arrow"></span>`));
                            indicator.setOffset([offset, 0]);
                            indicator.setPositioning("center-left");
                            this.setOffset([dx, dy]);
                            break;
                        case "right":
                            indicator.setElement(html(`<span class="simple-popup-right-arrow"></span>`));
                            indicator.setOffset([-offset, 0]);
                            indicator.setPositioning("center-right");
                            this.setOffset([-dx, dy]);
                            break;
                        default:
                            throw `unknown value: ${horizontalPosition}`;

                    }
                }
                break;
            default:
                throw `unknown value: ${verticalPosition}`;
        }

    }

    public setPosition(position: ol.Coordinate) {
        // make popup visible
        this.options.position = <any>position;
        if (!this.isDocked()) {
            // ol cannot determine if the position changes so triggers that it has changed creating a circular callback
            if (!arrayEqual(this.getPosition(), position)) {
                super.setPosition(position);
            }
            this.positionIndicator(this.options.pointerPosition);
        } else {
            // move map to this position
            let animation = <ol.olx.animation.AnimateOptions>{
                center: position
            };

            let view = this.options.map.getView();
            this.options.autoPanAnimation && mixin(animation, this.options.autoPanAnimation.duration);
            view.animate(animation);
        }

    }

    public panIntoView() {
        if (!this.isOpened()) return;
        if (this.isDocked()) return;
        super.panIntoView(); // need to add to typings
    }

    public destroy() {
        this.handlers.forEach(h => h());
        this.handlers = [];
        this.getMap() && this.getMap().removeOverlay(this);
        this.dispatchEvent(eventNames.dispose);
    }

    public show(coord: ol.Coordinate, html: string | HTMLElement = null) {

        if (html === null) {
            // leave the content along
        } else if (html instanceof HTMLElement) {
            this.content.innerHTML = "";
            this.content.appendChild(html);
        } else if (typeof html === "string") {
            this.content.innerHTML = html;
        } else {
            throw "unexpected html";
        }

        // determine the positioning before assigning a position to prevent launching unwanted panning animations
        if (this.options.autoPositioning) {
            this.setPositioning(smartpick(this, coord));
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
    public on(type: (string | string[]), listener: () => void): (ol.EventsKey | ol.EventsKey[]) {
        return super.on(type, listener);
    }

    public hide() {
        this.setPosition(undefined);
        this.indicator && this.indicator.setPosition(undefined);
        this.pages.clear();
        this.domNode.classList.add(classNames.hidden);
        this.dispatchEvent(eventNames.hide);
        return this;
    }

    public isOpened() {
        return !this.domNode.classList.contains(classNames.hidden);
    }

    public isDocked() {
        return this.domNode.classList.contains(classNames.docked);
    }

    public dock() {
        let map = this.getMap();
        this.options.map = map;
        this.options.parentNode = this.domNode.parentElement;

        map.removeOverlay(this);
        map.removeOverlay(this.indicator);
        this.domNode.classList.add(classNames.docked);
        this.options.dockContainer.appendChild(this.domNode);
        this.dispatchEvent(eventNames.dock);
        return this;
    }

    public undock() {
        let map = this.options.map;
        this.options.parentNode.appendChild(this.domNode);
        this.domNode.classList.remove(classNames.docked);
        map.addOverlay(this);
        map.addOverlay(this.indicator);
        this.dispatchEvent(eventNames.undock);
        // probably should be a "undock" listener?
        this.show(this.options.position);
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
