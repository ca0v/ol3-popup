//import "xstyle/css!ol3-popup/css/ol3-popup.css";
import ol = require("openlayers");
import { Popup } from "../ol3-popup/ol3-popup";
import FeatureCreator = require("./extras/feature-creator");
import { html as asHtml, range, shuffle } from "ol3-fun/index";
import $ = require("jquery");
import { MapMaker } from "./extras/map-maker";
import { slowloop } from "ol3-fun/ol3-fun/slowloop";

const css = `
`;

function circle(radius = 1, points = 36) {
	if (points < 3) throw "a circle must contain at least three points";
	if (radius <= 0) throw "a circle must have a positive radius";
	let a = 0;
	let dr = (2 * Math.PI) / (points - 1);
	let result = new Array(points) as Array<[number, number]>;
	for (let i = 0; i < points - 1; i++) {
		result[i] = [radius * Math.sin(a), radius * Math.cos(a)];
		a += dr;
	}
	result[result.length - 1] = result[0]; // properly close
	return result;
}

const css_popup = `

.dock-container {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 200px;
    height: 300px;
    border: 1px solid rgba(0,0,0,0.1);
    display: inline-block;
    padding: 20px;
    background: transparent;
    pointer-events: none;
}

.ol-popup {
    width: 300px;
    min-height: 50px;
    background: white;
    color: black;
    border: 4px solid black;
    border-radius: 12px;
}

.ol-popup:after {
    border-top-color: black;
}

.ol-popup .ol-popup-content {
    padding: 0;
}

.ol-popup .ol-popup-content > *:first-child {
    margin-right: 36px;
    overflow: hidden;
    display: block;
}

.ol-popup .pagination button {
    border:none;
    background:transparent;
}

.ol-popup .ol-popup-closer {
    width: 24px;
    height: 24px;    
    text-align: center;
    border-top-right-radius: 8px;
}

.ol-popup .ol-popup-docker {
    width: 24px;
    height: 24px;
    text-align: center;
}

.ol-popup .ol-popup-closer:hover {
    background-color: red;
    color: white;
}

.ol-popup .ol-popup-docker:hover {
    background-color: #999;
    color: white;
}

.ol-popup .ol-popup-content > *:first-child {
    margin-right: 40px;
}

.ol-popup .arrow.active:hover {
    background-color: #999;
    color: white;    
}

`;

const html = `
<div class="map"></div>
<div class='dock-container'></div>
`;

const sample_content = [
	"The story of the three little pigs...",
	"This little piggy went to market",
	"This little piggy stayed home",
	"This little piggy had roast beef",
	"This little piggy had none",
	"And this little piggy, <br/>this wee little piggy, <br/>when wee, wee, wee, wee <br/>all the way home!"
];

export let center = ol.proj.transform([-85, 15], "EPSG:4326", "EPSG:3857");

export function run() {
	document.head.appendChild(asHtml(`<style name="paging" type='text/css'>${css}</style>`));
	document.body.appendChild(asHtml(`<div>${html}</div>`));

	let mapContainer = <HTMLDivElement>document.getElementsByClassName("map")[0];
	let dockContainer = <HTMLDivElement>document.getElementsByClassName("dock-container")[0];

	let map = MapMaker(mapContainer);
	map.getView().animate({ center: center, zoom: 12 });

	let popup = Popup.create({
		map: map,
		autoPan: true,
		autoPanMargin: 20,
		autoPanAnimation: {
			source: null,
			duration: 50
		},
		autoPopup: true,
		showCoordinates: true,
		css: css_popup,
		dockContainer: dockContainer
	});

	popup.on("show", () => console.log(`show popup`));
	popup.on("hide", () => console.log(`hide popup`));
	popup.pages.on("goto", () => console.log(`goto page: ${popup.pages.activeIndex}`));

	{
		let points = circle(10000, 15).map(n => new ol.geom.Point([center[0] + n[0], center[1] + n[1]]));
		let page6Promise = $.Deferred<string>();
		let d2 = $.Deferred<HTMLElement>();
		let page6div = document.createElement("div");
		page6div.innerHTML = "<p>Page 6: This function promise resolves to a div element</p>";
		let div2 = asHtml("<div>P</div>");
		setInterval(() => (div2.innerHTML = new Date().toTimeString()), 1000);

		slowloop(
			[
				() => {
					FeatureCreator.create({
						map: map
					});
					popup.show(center, "<div>Click the map to see a popup</div>");
				},
				() => popup.dock(),
				() => popup.undock(),
				() => popup.pages.add(div2, points[popup.pages.count]),
				() => {
					let count = 0;
					popup.pages.add(
						() => `<p>Page 2: This string function has been called ${++count} times</p>`,
						points[popup.pages.count]
					);
				},
				() => popup.pages.goto(0),
				() => [3, 4, 5].map(i => popup.pages.add(`Page ${i}: Basic string pages`, points[popup.pages.count])),
				() => popup.pages.next(),
				() => popup.pages.next(),
				() => popup.pages.next(),
				() => popup.pages.add(page6Promise, points[popup.pages.count]),
				() => popup.pages.next(),
				() => page6Promise.resolve("<p>Page 6: This promise resolves to a string<p>"),
				() => popup.pages.add(d2, points[popup.pages.count]),
				() => popup.pages.next(),
				() => d2.resolve(page6div),
				() => {
					let count = 0;
					popup.pages.add(() => {
						let div = document.createElement("div");
						div.innerHTML = `<p>Page 8: This dom function has been called ${++count} times</p>`;
						return div;
					}, points[popup.pages.count]);
				},
				() => popup.pages.next(),
				() => sample_content.map(m => popup.pages.add(m, points[popup.pages.count])),
				() => popup.pages.goto(popup.pages.count - 1)
			],
			200
		).then(() =>
			slowloop(
				range(popup.pages.count)
					.reverse()
					.map(n => () => popup.pages.goto(n)),
				200,
				2
			)
		);
	}
}
