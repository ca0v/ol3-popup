import ol = require("openlayers");
import { Popup } from "../ol3-popup";
import $ = require("jquery");

function getInteriorPoint(geom: ol.geom.Geometry) {
	if ((<any>geom).getInteriorPoint) return (<any>geom)["getInteriorPoint"]().getCoordinates();
	return ol.extent.getCenter(geom.getExtent());
}

export type SourceType = HTMLElement | string | JQueryDeferred<HTMLElement | string>;
export type SourceCallback = () => SourceType;

const classNames = {
	pages: "pages",
	page: "page"
};

const eventNames = {
	add: "add",
	clear: "clear",
	goto: "goto",
	remove: "remove"
};

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

function getId() {
	return `_${Math.random() * 1000000}`;
}
/**
 * Collection of "pages"
 */
export class Paging extends ol.Observable implements IPaging {
	private _pages: Array<IPage>;

	private _activePage: IPage;
	domNode: HTMLDivElement;

	constructor(
		public options: {
			popup: Popup;
		}
	) {
		super();
		this._pages = [];
		this.domNode = document.createElement("div");
		this.domNode.classList.add(classNames.pages);
		options.popup.domNode.appendChild(this.domNode);
	}

	get activePage() {
		return this._activePage;
	}

	get activeIndex() {
		return this._pages.indexOf(this._activePage);
	}

	get count() {
		return this._pages.length;
	}

	on(name: string, listener: () => void): ol.EventsKey | ol.EventsKey[];
	on(
		name: "add",
		listener: (
			evt: {
				pageIndex: number;
				feature: ol.Feature;
				element: HTMLElement;
				geom: ol.geom.Geometry;
			}
		) => void
	): ol.EventsKey | ol.EventsKey[];
	on(name: "clear", listener: () => void): ol.EventsKey | ol.EventsKey[];
	on(name: "goto", listener: () => void): ol.EventsKey | ol.EventsKey[];
	on(
		name: "remove",
		listener: (
			evt: {
				pageIndex: number;
				feature: ol.Feature;
				element: HTMLElement;
				geom: ol.geom.Geometry;
			}
		) => void
	): ol.EventsKey | ol.EventsKey[];
	on(name: string, listener: (evt?: any) => void) {
		return super.on(name, listener);
	}

	private findPage(feature: ol.Feature) {
		return this._pages.filter(p => p.feature === feature)[0];
	}

	private removePage(page: IPage) {
		let index = this._pages.indexOf(page);
		if (0 <= index) {
			this._pages.splice(index, 1);
			let count = this._pages.length;
			if (index >= count) index == count - 1;
			this.goto(index);
		}
	}

	addFeature(
		feature: ol.Feature,
		options: {
			searchCoordinate: ol.Coordinate;
		}
	) {
		let page = this.findPage(feature);
		if (page) {
			this.goto(this._pages.indexOf(page));
			return page;
		}

		// if click location intersects with geometry then
		// use it as the page location otherwise use closest point
		let geom = feature.getGeometry();
		if (geom.intersectsCoordinate(options.searchCoordinate)) {
			geom = new ol.geom.Point(options.searchCoordinate);
		} else {
			geom = new ol.geom.Point(geom.getClosestPoint(options.searchCoordinate));
		}

		page = {
			element: document.createElement("div"),
			feature: feature,
			location: geom,
			uid: getId()
		};
		this._pages.push(page);

		this.dispatchEvent({
			type: eventNames.add,
			element: page.element,
			feature: page.feature,
			geom: page.location,
			pageIndex: page.uid
		});

		return page;
	}

	add(source: SourceType | SourceCallback, geom: ol.geom.Geometry) {
		let page: IPage;

		let pageDiv = document.createElement("div");

		if (false) {
		} else if (typeof source === "string") {
			pageDiv.innerHTML = source as string;
			this._pages.push(
				(page = {
					element: <HTMLElement>pageDiv,
					location: geom,
					uid: getId()
				})
			);
		} else if (typeof (<any>source).appendChild === "function") {
			pageDiv.appendChild(source as HTMLElement);
			pageDiv.classList.add(classNames.page);
			this._pages.push(
				(page = {
					element: pageDiv,
					location: geom,
					uid: getId()
				})
			);
		} else if ((<any>source)["then"]) {
			let d = <JQueryDeferred<HTMLElement | string>>source;
			pageDiv.classList.add(classNames.page);
			this._pages.push(
				(page = {
					element: pageDiv,
					location: geom,
					uid: getId()
				})
			);
			$.when(d).then(v => {
				if (typeof v === "string") {
					pageDiv.innerHTML = v;
				} else {
					pageDiv.appendChild(v);
				}
			});
		} else if (typeof source === "function") {
			// response can be a DOM, string or promise
			pageDiv.classList.add("page");
			this._pages.push(
				(page = {
					callback: <SourceCallback>source,
					element: pageDiv,
					location: geom,
					uid: getId()
				})
			);
		} else {
			throw `invalid source value: ${source}`;
		}

		this.dispatchEvent({
			type: eventNames.add,
			element: pageDiv,
			feature: null,
			geom: geom,
			pageIndex: this._pages.length - 1
		});

		return page;
	}

	clear() {
		this._activePage = null;
		this._pages = [];
		this.dispatchEvent(eventNames.clear);
	}

	goto(index: number | string) {
		let page: IPage;
		if (typeof index === "number") {
			page = this._pages[index];
		} else {
			page = this._pages.filter(p => p.uid === index)[0];
		}
		if (!page) return;

		let popup = this.options.popup;

		if (page.feature) {
			this.options.popup.show(
				getInteriorPoint(page.location || page.feature.getGeometry()),
				popup.options.asContent(page.feature)
			);

			this._activePage = page;

			this.dispatchEvent(eventNames.goto);

			return;
		}

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
			this._activePage = page;
			// position popup
			this.options.popup.show(getInteriorPoint(page.location), page.element);
			this.dispatchEvent(eventNames.goto);
		});
	}

	next() {
		0 <= this.activeIndex && this.activeIndex < this.count && this.goto(this.activeIndex + 1);
	}

	prev() {
		0 < this.activeIndex && this.goto(this.activeIndex - 1);
	}

	// TODO: add indexOf to ol-fun
	indexOf(feature: ol.Feature) {
		let result = -1;

		this._pages.some((f, i) => {
			if (f.feature === feature) {
				result = i;
				return true;
			}
			return false;
		});

		return result;
	}
}
