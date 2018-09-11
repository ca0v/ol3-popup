import ol = require("openlayers");
import { describe, it, should, shouldEqual, stringify, slowloop } from "ol3-fun/tests/base";
import { range, pair } from "ol3-fun/index";
import { Popup, DEFAULT_OPTIONS, PopupOptions } from "../../index";

describe("Popup Options", () => {
	it("Popup", () => {
		should(!!Popup, "Popup");
	});

	it("DEFAULT_OPTIONS", () => {
		checkDefaultInputOptions(DEFAULT_OPTIONS);
	});
});

describe("Popup Constructor", () => {
	it("Constructors", () => {
		let map = new ol.Map({});
		try {
			// todo: ideally this would be possibles
			Popup.create().destroy();
		} catch {
			should(true, "empty constructor throws, either map or autoPopup=false necessary");
		}
		Popup.create({ autoPopup: false }).destroy();
		Popup.create({ map: map }).destroy();

		map.setTarget(null);
	});
});

describe("Popup Paging", () => {
	it("Paging", done => {
		let target = document.createElement("div");
		document.body.appendChild(target);

		let map = new ol.Map({
			target: target,
			layers: [],
			view: new ol.View({
				center: [0, 0],
				projection: "EPSG:3857",
				zoom: 24
			})
		});
		map.once("postrender", () => {
			let popup = Popup.create({ map: map });
			let c = map.getView().getCenter();
			let points = pair(range(3), range(3)).map(n => new ol.geom.Point([c[0] + n[0], c[1] + n[1]]));
			let count = 0;
			points.forEach((p, i) => {
				popup.pages.add(() => `Page ${i + 1}: visit counter: ${++count}`, p);
				shouldEqual(popup.pages.count, i + 1, `${i + 1} pages`);
			});

			let i = 0;
			slowloop([() => popup.pages.goto(i++)], 30, popup.pages.count)
				.then(() => {
					shouldEqual(
						popup.getElement().getElementsByClassName("ol-popup-content")[0].textContent,
						"Page 9: visit counter: 9",
						"last page contains correct text"
					);
					map.setTarget(null);
					target.remove();
					done();
				})
				.fail(ex => should(!ex, ex));
		});
	});
});

function checkDefaultInputOptions(options: PopupOptions) {
	should(!!options, "options");
	shouldEqual(typeof options.asContent, "function", "asContent");
	shouldEqual(options.autoPan, true, "autoPan");
	shouldEqual(!options.autoPanAnimation, true, "autoPanAnimation");
	shouldEqual(options.autoPanMargin, 20, "autoPanMargin");
	shouldEqual(options.autoPopup, true, "autoPopup");
	shouldEqual(options.autoPositioning, true, "autoPositioning");
	shouldEqual(options.className, "ol-popup", "className");
	shouldEqual(typeof options.css, "string", "css");
	shouldEqual(!options.dockContainer, true, "dockContainer");
	shouldEqual(!options.element, true, "element");
	shouldEqual(!options.id, true, "id");
	shouldEqual(options.insertFirst, true, "insertFirst");
	shouldEqual(!options.layers, true, "layers");
	shouldEqual(!options.map, true, "map");
	shouldEqual(!options.multi, true, "multi");
	shouldEqual(stringify(options.offset), stringify([0, -10]), "offset");
	shouldEqual(!options.pagingStyle, true, "pagingStyle");
	shouldEqual(options.pointerPosition, 20, "pointerPosition");
	shouldEqual(!options.position, true, "position");
	shouldEqual(options.positioning, "bottom-center", "positioning");
	shouldEqual(!options.showCoordinates, true, "showCoordinates");
	shouldEqual(options.stopEvent, true, "stopEvent");
}
