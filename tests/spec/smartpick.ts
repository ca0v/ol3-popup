import ol = require("openlayers");
import { describe, it, shouldEqual, slowloop } from "ol3-fun/tests/base";
import { smartpick } from "../../ol3-popup/commands/smartpick";
import { MapMaker } from "../../examples/extras/map-maker";
import { Popup } from "../../index";
import { once } from "../../examples/extras/once";
import { kill } from "../extras/kill";

function PopupMaker(map: ol.Map) {
	let popup = Popup.create({
		id: "spec-smartpicker-test",
		map: map,
		autoPanAnimation: {
			duration: 200,
			source: [0, 0]
		},
		css: `
				.ol-popup-element { color: rgb(200, 200, 200) }
                .ol-popup-element .pagination { margin-bottom: 2px }
                .ol-popup-element button.arrow  { background: transparent; border: none; color: rgb(200, 200, 200); }
                .ol-popup-content { color: rgb(200, 200, 200); max-width: 8em; max-height: 4em; margin: 0.5em; padding: 0.5em; overflow: hidden; overflow-y: auto} 
				.ol-popup { background-color: rgb(30, 30, 30); border: 2px solid rgb(200, 200, 200); } 
				.ol-popup:before {
					content: " ";
					position: absolute;
					top: -2px;
					left: -2px;
					right: -2px;
					bottom: -2px;
					border: 1px solid rgb(30, 30, 30);
				}
                .ol-popup-element .ol-popup-closer { right: 4px }`
	});
	return popup;
}

function createMapDiv() {
	let div = document.createElement("div");
	div.className = "map";
	document.body.appendChild(div);
	return div;
}

function GridMapMaker() {
	let [w, h] = [20000, 20000];
	let points: Array<[number, number]> = GridMaker(w, h);
	let div = createMapDiv();
	let map = MapMaker(div);
	map.getView().setCenter([0, 0]);
	let rez = map.getView().getResolutionForExtent([-w, -h, w, h]);
	map.getView().setResolution(rez);
	let vectors = VectorMaker();
	map.addLayer(vectors);
	vectors.getSource().addFeatures(
		points.map(p => {
			let geom = new ol.geom.Point(p);
			let ll = ol.proj.toLonLat(p);
			return new ol.Feature({
				geometry: geom,
				latlon: `${ll[1].toPrecision(5)} ${ll[0].toPrecision(5)}`
			});
		})
	);
	return { map, points, div };
}

function GridMaker(w: number, h: number): [number, number][] {
	return [[-w, h], [0, h], [w, h], [w, 0], [w, -h], [0, -h], [-w, -h], [-w, 0], [0, 0]];
}

function VectorMaker() {
	let vectorSource = new ol.source.Vector({
		features: []
	});

	let vectorLayer = new ol.layer.Vector({
		source: vectorSource,
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: "rgba(255, 255, 255, 0.2)"
			}),
			stroke: new ol.style.Stroke({
				color: "#ffcc33",
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 7,
				fill: new ol.style.Fill({
					color: "#ffcc33"
				})
			})
		})
	});

	return vectorLayer;
}

describe("smartpick", () => {
	it("places 9 popups on the map", () => {
		let { map, points, div } = GridMapMaker();
		div.style.width = div.style.height = "480px";
		div.style.border = "1px solid white";
		map.setTarget(null);
		map.setTarget(div);
		// //map.getView().setZoom(map.getView().getZoom() + 1);
		let popups = points.map(() => {
			let popup = PopupMaker(map);
			popup.options.autoPopup = false;
			popup.options.pointerPosition = 0;
			popup.options.indicatorOffsets["top-right"][1] -= 0;
			popup.options.indicatorOffsets["top-center"][1] -= 1;
			popup.options.indicatorOffsets["top-left"][1] -= 0;
			popup.options.indicatorOffsets["center-left"][0] += 3;
			popup.options.indicatorOffsets["center-right"][0] += 3;
			popup.options.indicatorOffsets["bottom-left"][1] += 1;
			popup.options.indicatorOffsets["bottom-center"][1] += 1;
			popup.options.indicatorOffsets["bottom-right"][1] += 1;
			return popup;
		});

		return once(map, "postrender", () => {
			return slowloop(
				points.map((p, i) => () => {
					let popup = popups[i];
					popup.show(p, smartpick(popup, p));
				}),
				0
			);
		})
			.then(kill(popups[0]))
			.then(() => popups.map(p => p.destroy()));
	});

	it("configures a map with popup and points in strategic locations to ensure the positioning is correct", () => {
		// map should have an width and height of 1000 units
		// points should be in the four corners and four sides
		let { map, points } = GridMapMaker();
		return once(map, "postrender", () => {
			let popup = PopupMaker(map);
			return slowloop(
				points.map(p => () => {
					let expected = smartpick(popup, p);
					popup.show(p, `${expected}`);
					let actual = popup.getPositioning();
					shouldEqual(expected, actual, "positioning");
				}),
				400,
				1
			).then(kill(popup, 0));
		});
	});
});
