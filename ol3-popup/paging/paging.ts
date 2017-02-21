import ol = require("openlayers");
import { Popup } from "../ol3-popup";
import $ = require("jquery");

function getInteriorPoint(geom: ol.geom.Geometry) {
    if (geom["getInteriorPoint"]) return (<ol.geom.Point>geom["getInteriorPoint"]()).getCoordinates();
    return ol.extent.getCenter(geom.getExtent());
}

export type SourceType = HTMLElement | string | JQueryDeferred<HTMLElement | string>;
export type SourceCallback = () => SourceType;

const classNames = {
    pages: "pages",
    page: "page"
}

const eventNames = {
    add: "add",
    clear: "clear",
    goto: "goto"
}

/**
 * Collection of "pages"
 */
export class Paging {

    private _pages: Array<{
        callback?: SourceCallback;
        element: HTMLElement;
        location: ol.geom.Geometry;
    }>;

    private _activeIndex: number;
    domNode: HTMLDivElement;

    constructor(public options: { popup: Popup }) {
        this._pages = [];
        this.domNode = document.createElement("div");
        this.domNode.classList.add(classNames.pages);
        options.popup.domNode.appendChild(this.domNode);
    }

    get activePage() {
        return this._pages[this._activeIndex];
    }

    get activeIndex() {
        return this._activeIndex;
    }

    get count() {
        return this._pages.length;
    }

    dispatch(name: string) {
        this.domNode.dispatchEvent(new Event(name));
    }

    on(name: string, listener: EventListener) {
        this.domNode.addEventListener(name, listener);
    }

    add(source: SourceType | SourceCallback, geom?: ol.geom.Geometry) {
        if (false) {
        }

        else if (typeof source === "string") {
            let page = document.createElement("div");
            page.innerHTML = source;
            this._pages.push({
                element: <HTMLElement>page,
                location: geom
            });
        }

        else if (source["appendChild"]) {
            let page = <HTMLElement>source;
            page.classList.add(classNames.page);
            this._pages.push({
                element: page,
                location: geom
            });
        }

        else if (source["then"]) {
            let d = <JQueryDeferred<HTMLElement | string>>source;
            let page = document.createElement("div");
            page.classList.add(classNames.page);
            this._pages.push({
                element: page,
                location: geom
            });
            $.when(d).then(v => {
                if (typeof v === "string") {
                    page.innerHTML = v;
                } else {
                    page.appendChild(v);
                }
            });
        }

        else if (typeof source === "function") {
            // response can be a DOM, string or promise            
            let page = document.createElement("div");
            page.classList.add("page");
            this._pages.push({
                callback: <SourceCallback>source,
                element: page,
                location: geom
            });
        }

        else {
            throw `invalid source value: ${source}`;
        }

        this.dispatch(eventNames.add);
    }

    clear() {
        let activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
        this._activeIndex = -1;
        this._pages = [];
        if (activeChild) {
            this.domNode.removeChild(activeChild.element);
            this.dispatch(eventNames.clear);
        }
    }

    goto(index: number) {
        let page = this._pages[index];
        if (!page) return;

        let activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
        let d = $.Deferred();
        if (page.callback) {
            let refreshedContent = page.callback();
            $.when(refreshedContent).then(v => {
                if (false) {
                } else if (typeof v === "string") {
                    page.element.innerHTML = v;
                } else if (typeof v["innerHTML"] !== "undefined") {
                    page.element.innerHTML = "";
                    page.element.appendChild(v);
                } else {
                    throw `invalid callback result: ${v}`;
                }
                d.resolve();
            });
        } else {
            d.resolve();
        }

        d.then(() => {
            // replace page
            activeChild && activeChild.element.remove();
            this._activeIndex = index;
            this.domNode.appendChild(page.element);

            // position popup
            if (page.location) {
                this.options.popup.setPosition(getInteriorPoint(page.location));
            }
            this.dispatch(eventNames.goto);
        });
    }

    next() {
        (0 <= this.activeIndex) && (this.activeIndex < this.count) && this.goto(this.activeIndex + 1);
    }

    prev() {
        (0 < this.activeIndex) && this.goto(this.activeIndex - 1);
    }
}

