import ol = require("openlayers");
import { describe, it, should, shouldEqual, stringify, slowloop } from "ol3-fun/tests/base";
import { range, pair } from "ol3-fun/index";
import { Popup, DEFAULT_OPTIONS, PopupOptions } from "../../index";
import { once } from "../../examples/extras/once";
import { kill } from "../extras/kill";

function createMapDiv() {
	let div = document.createElement("div");
	div.className = "map";
	document.body.appendChild(div);
	return div;
}

describe("spec/popup", () => {
	it("Popup", () => {
		should(!!Popup, "Popup");
	});

	it("DEFAULT_OPTIONS", () => {
		checkDefaultInputOptions(DEFAULT_OPTIONS);
		should(!DEFAULT_OPTIONS.pagingStyle, "pagingStyle");
		// workaround to create a popup w/out a map
		let p1 = Popup.create({ autoPopup: false });
		p1.options.autoPopup = true;
		checkDefaultInputOptions(p1.options);
		should(!!p1.options.pagingStyle, "pagingStyle");
	});

	it("Ensures options do not leak into other instances", () => {
		let p1 = Popup.create({ autoPopup: false });
		let p2 = Popup.create({ autoPopup: false });
		let expected = p1.options.indicatorOffsets["top-center"][0];
		// settings on p1 has no effect on p2
		p1.options.indicatorOffsets["top-center"][0] += 200;
		let actual = p2.options.indicatorOffsets["top-center"][0];
		shouldEqual(actual, expected, "default did not change");
		p1.destroy();
		p2.destroy();
	});

	it("Ensures global options can be tweaked", () => {
		let originalDefaultValue = DEFAULT_OPTIONS.indicatorOffsets["top-center"][0];
		let expected = (DEFAULT_OPTIONS.indicatorOffsets["top-center"][0] += 200);
		try {
			let p1 = Popup.create({ autoPopup: false });
			let actual = p1.options.indicatorOffsets["top-center"][0];
			shouldEqual(actual, expected, "default did change");
			p1.destroy();
		} finally {
			DEFAULT_OPTIONS.indicatorOffsets["top-center"][0] = originalDefaultValue;
		}
	});

	it("Constructors", () => {
		let map = new ol.Map({});
		try {
			// todo: ideally this would be possibles but it currently leaves dangling resources
			Popup.create({ id: "constructor-test" }).destroy();
		} catch {
			should(true, "empty constructor throws, either map or autoPopup=false necessary");
		}

		Popup.create({ autoPopup: false }).destroy();
		Popup.create({ map: map }).destroy();

		map.setTarget(null);
	});

	it("Paging", () => {
		let target = createMapDiv();

		let map = new ol.Map({
			target: target,
			layers: [],
			view: new ol.View({
				center: [0, 0],
				projection: "EPSG:3857",
				zoom: 24
			})
		});
		let popup = Popup.create({ id: "paging-test", map: map });
		return once(map, "postrender", () => {
			let c = map.getView().getCenter();
			let points = pair(range(3), range(3)).map(n => new ol.geom.Point([c[0] + n[0], c[1] + n[1]]));
			let count = 0;
			points.forEach((p, i) => {
				popup.pages.add(() => `Page ${i + 1}: visit counter: ${++count}`, p);
				shouldEqual(popup.pages.count, i + 1, `${i + 1} pages`);
			});

			let i = 0;
			return slowloop([() => popup.pages.goto(i++)], 100, popup.pages.count).then(() => {
				shouldEqual(
					popup.getElement().getElementsByClassName("ol-popup-content")[0].textContent,
					"Page 9: visit counter: 9",
					"last page contains correct text"
				);
			});
		}).then(kill(popup));
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
	shouldEqual(!!options.id, true, "id");
	shouldEqual(options.insertFirst, true, "insertFirst");
	shouldEqual(!options.layers, true, "layers");
	shouldEqual(!options.map, true, "map");
	shouldEqual(!options.multi, true, "multi");
	shouldEqual(stringify(options.offset), stringify([0, -10]), "offset");
	shouldEqual(options.pointerPosition, 20, "pointerPosition");
	shouldEqual(!options.position, true, "position");
	shouldEqual(options.positioning, "bottom-center", "positioning");
	shouldEqual(!options.showCoordinates, true, "showCoordinates");
	shouldEqual(options.stopEvent, true, "stopEvent");
}
