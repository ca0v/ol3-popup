//import "xstyle/css!ol3-popup/css/ol3-popup.css";
import ol = require("openlayers");
import { Popup } from "../ol3-popup/ol3-popup";
import Symbolizer = require("ol3-symbolizer/index");
import { html as asHtml } from "ol3-fun/ol3-fun/common";
import FeatureCreator = require("./extras/feature-creator");

interface IPopupInfo {
    offset?: [number, number];
    positioning?: ol.OverlayPositioning;
    pointerPosition?: number;
}

const symbolizer = new Symbolizer.Symbolizer.StyleConverter();

function setStyle(feature: ol.Feature, json: Symbolizer.Format.Style & { popup: IPopupInfo }) {
    let style = symbolizer.fromJson(json);
    feature.getGeometry().set("popup-info", json.popup);
    feature.setStyle(style);
    return style;
}

const css = `
head, body {
    background-color: black;
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
    opacity: 0.8;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

`;

const html = `
<div class="map">
<label>
I think the idea here was to place popup data directly on the geometry so, for example, the triangle will have center-center popup, the circle bottom-center and the star top-center
but it is not complete.  I'm not sure what the geom is returned from paging...defer until after paging tests are complete.
</label>
</div>
`;

const center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');


export function run() {

    document.head.appendChild(asHtml(`<style name="style-offset" type='text/css'>${css}</style>`));
    document.body.appendChild(asHtml(`<div>${html}</div>`));

    let mapContainer = document.getElementsByClassName("map")[0];

    let map = new ol.Map({
        target: mapContainer,
        layers: [
        ],
        view: new ol.View({
            center: center,
            zoom: 16
        })
    });

    let popup = Popup.create({
        map: map,
        autoPan: true,
        autoPanMargin: 20,
        autoPanAnimation: {
            source: null,
            duration: 500
        },
        pointerPosition: 20,
        positioning: "top-left",
        offset: [0, -10],
        css: `
        .ol-popup {
            background-color: white;
            border: 1px solid black;
            padding: 4px;
            width: 200px;
        }
        `
    });

    let vectorSource = new ol.source.Vector({
        features: []
    });

    let vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: (f: ol.Feature, res: number) => <ol.style.Style>f.getStyle()
    });

    map.addLayer(vectorLayer);

    FeatureCreator
        .create({ map: map })
        .addSomeFeatures(vectorLayer, center);

    popup.on("show", () => {
        popup.applyOffset(popup.options.offset || [0, 0]);
    });

    popup.pages.on("goto", () => {
        let geom = popup.pages.activePage.location;
        let popupInfo = <IPopupInfo>geom.get("popup-info");
        if (popupInfo) {
            if (popupInfo.positioning) {
                let p = popup.getPositioning();
                if (p !== popupInfo.positioning) {
                    popup.setPositioning(popupInfo.positioning);
                    let h = popup.on("hide", () => {
                        ol.Observable.unByKey(h);
                        popup.setPositioning(p);
                    });
                }
            }
            if (popupInfo.offset) {
                popup.applyOffset(popupInfo.offset);
            }
        } else {
            popup.setOffset(popup.options.offset || [0, 0]);
        }
    });

}