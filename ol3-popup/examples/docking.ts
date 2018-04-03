//import "xstyle/css!ol3-popup/css/ol3-popup.css";
import ol = require("openlayers");
import $ = require("jquery");
import { Popup } from "../ol3-popup";
import { debounce, html as asHtml } from "ol3-fun/ol3-fun/common";

const css = `
head, body {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

body { 
    margin-top: 0;
    margin-left: 1px;
}

body * {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}

.map {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

`;

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

let center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');


export function run() {

    $(document.head).append(asHtml(`<style name="paging" type='text/css'>${css}</style>`));
    $(document.body).append(asHtml(`<div>${html}</div>`));

    let mapContainer = <HTMLDivElement>document.getElementsByClassName("map")[0];
    let dockContainer = <HTMLDivElement>document.getElementsByClassName("dock-container")[0];

    let map = new ol.Map({
        target: mapContainer,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: center,
            zoom: 6
        })
    });

    let p1 = Popup.create({
        map: map,
        autoPan: true,
        autoPanMargin: 20,
        autoPanAnimation: {
            source: null,
            duration: 500
        },
        autoPopup: true,
        showCoordinates: true,
        css: css_popup,
        dockContainer: dockContainer,
        pointerPosition: 150,
        xOffset: -4, // offset padding
        yOffset: 3,
        multi: true
    });

    p1.on("dock", debounce(() => {

        let h = p1.on("show", () => {
            let p = Popup.create({
                map: map,
                autoPopup: false,
                positioning: "top-center",
                asContent: (feature) => asHtml(`<b>Hi ${feature.get("hello")}</b>`)
            });

            p1.once(["undock", "dispose"], () => p.destroy());

            let feature = new ol.Feature({
                hello: "Hello",
                geometry: new ol.geom.Point(p1.options.position)
            });

            p.pages.addFeature(feature, { searchCoordinate: p1.options.position });
            p.pages.goto(0);

        });

        p1.once(["undock", "dispose"], () => ol.Observable.unByKey(h));


    }));

}
