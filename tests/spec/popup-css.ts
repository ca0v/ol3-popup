import ol = require("openlayers");
import { describe, it, should, shouldEqual, slowloop, stringify } from "ol3-fun/tests/base";
import { range, cssin, html } from "ol3-fun/ol3-fun/common";
import { Popup, DEFAULT_OPTIONS, DIAMONDS, TRIANGLES } from "../../index";
import { MapMaker } from "../../examples/extras/map-maker";
import { Positions } from "../../ol3-popup/@types/popup-options";
import { once } from "../../examples/extras/once";
import { kill } from "../extras/kill";

function createMapDiv() {
	let div = document.createElement("div");
	div.className = "map";
	document.body.appendChild(div);
	return div;
}

function rect(extent: ol.Extent) {
	let [x1, y1, x2, y2] = extent;
	return [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]] as Array<ol.Coordinate>;
}

function callout(
	points: ol.Pixel[],
	options: {
		index: number;
		size: number;
		width: number;
		skew: number;
		offset: number;
	}
) {
	let { index, size, width, offset, skew } = options;
	let a = points[index];
	let c = points[index + 1];
	let isVertical = a[0] === c[0];
	let isHorizontal = a[1] === c[1];
	let isLeft = isVertical && a[1] > c[1];
	let isRight = isVertical && a[1] < c[1];
	let isTop = isHorizontal && a[0] < c[0];
	let isBottom = isHorizontal && a[0] > c[0];
	let b: ol.Pixel = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
	if (isHorizontal) {
		b[0] += offset;
	}
	if (isVertical) {
		b[1] += offset; //isRight ? offset : isLeft ? -offset : 0;
	}
	let b0: ol.Pixel = [b[0], b[1]];
	let b1: ol.Pixel = [b[0], b[1]];
	if (isHorizontal) {
		if (isTop) {
			b[0] += skew;
			b[1] -= size;
			b0[0] -= width / 2;
			b1[0] += width / 2;
		}
		if (isBottom) {
			b[0] += skew;
			b[1] += size;
			b0[0] += width / 2;
			b1[0] -= width / 2;
		}
	}
	if (isVertical) {
		if (isLeft) {
			b[1] += skew;
			b[0] -= size;
			b0[1] += width / 2;
			b1[1] -= width / 2;
		}
		if (isRight) {
			b[1] += skew;
			b[0] += size;
			b0[1] -= width / 2;
			b1[1] += width / 2;
		}
	}
	points.splice(index + 1, 0, b0, b, b1);
	return points;
}

describe("ol3-popup/popup-css", () => {
	it("Ensures css is destroyed with popup", () => {
		let popup = Popup.create({
			id: "my-popup",
			autoPopup: false
		});
		let styleNode = document.getElementById("style-my-popup_options");
		should(!!styleNode, "css node exists");
		popup.destroy();
		styleNode = document.getElementById("style-my-popup_options");
		should(!styleNode, "css node does not exist");
	});

	it("DIAMONDS", () => {
		// TODO - uses different symbols for tooltip
		let div = createMapDiv();
		let map = MapMaker(div);

		let popup = Popup.create({
			id: "diamonds-test",
			map: map,
			indicators: DIAMONDS,
			indicatorOffsets: {
				"bottom-left": [15, 16],
				"bottom-center": [0, 16],
				"bottom-right": [15, 16],
				"center-left": [10, 0],
				"center-center": [0, 0],
				"center-right": [9, 0],
				"top-left": [15, 19],
				"top-center": [0, 19],
				"top-right": [15, 19]
			},
			pointerPosition: 1,
			positioning: "bottom-center",
			autoPositioning: false,
			css:
				DEFAULT_OPTIONS.css +
				`
				.ol-popup {
					background: silver;
					color: black;
					border-radius: 1em;
					padding: 1em;
					border-color: silver;
				}
				.ol-popup.top.right {
					border-top-right-radius: 0em;
				}	
				.ol-popup.top.left {
					border-top-left-radius: 0em;
				}	
				.ol-popup.bottom.right {
					border-bottom-right-radius: 0em;
				}	
				.ol-popup.bottom.left {
					border-bottom-left-radius: 0em;
				}	
				.ol-popup.center.left {
					border-top-left-radius: 0em;
					border-bottom-left-radius: 0em;
				}	
				.ol-popup.center.right {
					border-top-right-radius: 0em;
					border-bottom-right-radius: 0em;
				}	
				.popup-indicator { 
				color: silver;
				font-weight: 900;
			}
`
		});

		let vectorLayer = new ol.layer.Vector({
			source: new ol.source.Vector({ features: [new ol.Feature(new ol.geom.Point(map.getView().getCenter()))] })
		});
		map.addLayer(vectorLayer);

		return once(map, "postrender", () => {
			return slowloop(
				Object.keys(popup.options.indicators).map((k: Positions) => () => {
					popup.setPositioning(k);
					popup.show(map.getView().getCenter(), `Popup with ${k}`);
					shouldEqual(popup.indicator.getElement().textContent, popup.options.indicators[k], k);
				}),
				200
			)
				.then(kill(popup))
				.catch(ex => {
					should(!ex, ex);
				});
		});
	});

	it("renders a tooltip on a canvas", () => {
		let div = document.createElement("div");
		div.className = "canvas-container";
		let cssRemove = cssin(
			"canvas-test",
			`.canvas-container {
            display: inline-block;
            position: absolute;
            top: 20px;
            width: 200px;
			height: 200px;
			background: blue;
            border: 1px solid white;
        }`
		);
		div.innerHTML = "DIV CONTENT";
		let canvas = document.createElement("canvas");
		canvas.width = canvas.height = 200;
		canvas.style.position = "absolute";
		canvas.style.top = canvas.style.left = canvas.style.right = canvas.style.bottom = "0";
		div.appendChild(canvas);

		document.body.insertBefore(div, document.body.firstChild);

		let ctx = canvas.getContext("2d");
		ctx.strokeStyle = "white";
		ctx.lineWidth = 3;

		let clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

		let loop = [
			() => {
				let points = rect([10, 10, 190, 190]);
				clear();
				ctx.beginPath();
				ctx.moveTo(points[0][0], points[0][1]);
				points.forEach(p => ctx.lineTo(p[0], p[1]));
				ctx.closePath();
				ctx.stroke();
			}
		];
		{
			let points = range(4).map(index =>
				callout(rect([25, 25, 175, 175]), { index: index, size: 25, width: 25, skew: 10, offset: 20 })
			);
			loop = loop.concat(
				points.map(points => () => {
					clear();
					ctx.beginPath();
					ctx.moveTo(points[0][0], points[0][1]);
					points.forEach(p => ctx.lineTo(p[0], p[1]));
					ctx.closePath();
					ctx.stroke();
				})
			);
		}
		return $.when(
			slowloop(
				range(100).map(n => () => {
					div.style.left = div.style.top = 10 * Math.sin((n * Math.PI) / 100) * n + "px";
				}),
				50
			),
			slowloop(loop, 200).then(() => {
				loop = [];
				let points = range(70).map(index =>
					callout(rect([20, 20, 180, 180]), {
						index: 0,
						size: 10,
						width: 20,
						skew: 0,
						offset: 2 * index - 70
					})
				);
				points = points.concat(
					range(140).map(index =>
						callout(rect([20, 20, 180, 180]), {
							index: 1,
							size: 10,
							width: 20,
							skew: 0,
							offset: index - 70
						})
					)
				);
				points = points.concat(
					range(140)
						.reverse()
						.map(index =>
							callout(rect([20, 20, 180, 180]), {
								index: 2,
								size: 10,
								width: 20,
								skew: 0,
								offset: index - 70
							})
						)
				);
				points = points.concat(
					range(140)
						.reverse()
						.map(index =>
							callout(rect([20, 20, 180, 180]), {
								index: 3,
								size: 10,
								width: 20,
								skew: 0,
								offset: index - 70
							})
						)
				);
				loop = loop.concat(
					points.map(points => () => {
						clear();
						ctx.beginPath();
						ctx.moveTo(points[0][0], points[0][1]);
						points.forEach(p => ctx.lineTo(p[0], p[1]));
						ctx.closePath();
						ctx.stroke();
					})
				);
				// 4 * 140 * 2 * 10 ms => 11 seconds
				return slowloop(loop, 0).then(() => slowloop(loop.reverse(), 0).then(() => div.remove()));
			})
		).then(() => cssRemove());
	}).timeout(6000);
});
