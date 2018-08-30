
import ol = require("openlayers");
import { Popup } from "../ol3-popup/ol3-popup";
import { cssin, html as asHtml } from "ol3-fun/ol3-fun/common";
import FeatureCreator = require("./extras/feature-creator");

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

.map .toggle-active {
    position: absolute;
    top: 1em;
    left: 3em;
    z-index: 1;
}
`;

const popupCss = `
.ol-popup {
    background-color: white;
    padding: 4px;
    padding-top: 24px;
    border: 1px solid rgba(0, 0, 0, 1);
}
.pagination {
    min-width: 160px;
}
.pagination .page-num {
    min-width: 100px;
    display: inline-block;
    text-align: center; 
}
.pagination .arrow.btn-next {
    float: right;
}`;

const html = `
<div class="map">
    <input type="button" class="toggle-active" value="Toggle Popup"></input>
</div>
`;

const center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');


export function run() {

    cssin("activate", css);
    document.body.appendChild(asHtml(`<div>${html}</div>`));

    let mapContainer = document.getElementsByClassName("map")[0];

    let map = new ol.Map({
        target: mapContainer,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            projection: "EPSG:3857",
            center: center,
            zoom: 16
        })
    });

    let vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    map.addLayer(vectorLayer);

    FeatureCreator
        .create({ map: map })
        .addSomeFeatures(vectorLayer, center)

    let popup = Popup.create({
        map: map,
        css: popupCss,
        layers: [vectorLayer]
    });

    popup.set("active", false);

    let toggleButton = document.getElementsByClassName("toggle-active")[0];
    toggleButton.addEventListener("click", () => popup.set("active", !popup.get("active")));

}
