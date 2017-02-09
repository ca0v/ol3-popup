//import "xstyle/css!ol3-popup/css/ol3-popup.css";
import ol = require("openlayers");
import { Popup } from "../ol3-popup";
import FeatureSelector = require("../extras/feature-selector");
import Symbolizer = require("bower/ol3-symbolizer/ol3-symbolizer");

import $ = require("jquery");

interface IPopupInfo {
    offset?: [number, number];
    positioning?: ol.OverlayPositioning;
    pointerPosition?: number;
}

const symbolizer = new Symbolizer.StyleConverter();

function setStyle(feature: ol.Feature, json: Symbolizer.Format.Style & { popup: IPopupInfo }) {
    let style = symbolizer.fromJson(json);
    feature.getGeometry().set("popup-info", json.popup);
    feature.setStyle(style);
    return style;
}

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

const html = `
<div class="map"></div>
`;

let center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');


export function run() {

    $(`<style name="style-offset" type='text/css'>${css}</style>`).appendTo('head');
    $(`<div>${html}</div>`).appendTo('body');

    let mapContainer = $(".map")[0];

    let map = new ol.Map({
        target: mapContainer,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: center,
            zoom: 16
        })
    });

    let popup = new Popup({
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

    map.addOverlay(popup);

    let selector = new FeatureSelector({
        map: map,
        popup: popup,
        title: "<b>Alt+Click</b> creates markers",
    });

    let vectorSource = new ol.source.Vector({
        features: []
    });

    let vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: (f: ol.Feature, res: number) => <ol.style.Style>f.getStyle()
    });

    map.addLayer(vectorLayer);

    let circleFeature = new ol.Feature();
    circleFeature.setGeometry(new ol.geom.Point(center));

    setStyle(circleFeature, {
        popup: {
            offset: [0, -10],
            pointerPosition: -1,
            positioning: "top-right"
        },
        "circle": {
            "fill": {
                "color": "rgba(255,0,0,0.90)"
            },
            "opacity": 1,
            "stroke": {
                "color": "rgba(0,0,0,0.5)",
                "width": 2
            },
            "radius": 10
        }
    });

    let svgFeature = new ol.Feature();
    svgFeature.setGeometry(new ol.geom.Point([center[0] + 1000, center[1]]));
    setStyle(svgFeature, {
        popup: {
            offset: [0, -18],
            pointerPosition: -1,
            positioning: "top-left"
        },
        "image": {
            "imgSize": [36, 36],
            "anchor": [32, 32],
            "stroke": {
                "color": "rgba(255,25,0,0.8)",
                "width": 10
            },
            "path": "M23 2 L23 23 L43 16.5 L23 23 L35 40 L23 23 L11 40 L23 23 L3 17 L23 23 L23 2 Z"
        }
    });

    let markerFeature = new ol.Feature();
    markerFeature.setGeometry(new ol.geom.Point([center[0] + 1000, center[1] + 1000]));
    setStyle(markerFeature, {
        popup: {
            offset: [0, -64],
            pointerPosition: -1,
            positioning: "bottom-left"
        },
        "circle": {
            "fill": {
                "gradient": {
                    "type": "linear(32,32,96,96)",
                    "stops": "rgba(0,255,0,0.1) 0%;rgba(0,255,0,0.8) 100%"
                }
            },
            "opacity": 1,
            "stroke": {
                "color": "rgba(0,255,0,1)",
                "width": 1
            },
            "radius": 64
        },
        "image": {
            "anchor": [16, 48],
            "imgSize": [32, 48],
            "anchorXUnits": "pixels",
            "anchorYUnits": "pixels",
            "src": "http://openlayers.org/en/v3.20.1/examples/data/icon.png"
        }
    });

    let markerFeature2 = new ol.Feature();
    markerFeature2.setGeometry(new ol.geom.Point([center[0], center[1] + 1000]));
    setStyle(markerFeature2, {
        popup: {
            offset: [0, -36],
            pointerPosition: -1,
            positioning: "bottom-right"
        },
        "circle": {
            "fill": {
                color: "rgba(100,100,100,0.5)"
            },
            "opacity": 1,
            "stroke": {
                "color": "rgba(100,100,100,1)",
                "width": 8
            },
            "radius": 32
        }
    });

    popup.on("show", () => {
        popup.applyOffset(popup.options.offset || [0, 0]);
        popup.setIndicatorPosition(popup.options.pointerPosition);
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
                        popup.unByKey(h);
                        popup.setPositioning(p);
                    });
                }
            }
            if (popupInfo.offset) {
                popup.applyOffset(popupInfo.offset);
            }
            popup.setIndicatorPosition(popupInfo.pointerPosition || popup.options.pointerPosition);
        } else {
            popup.setOffset(popup.options.offset || [0, 0]);
        }
    });

    vectorSource.addFeatures([circleFeature, svgFeature, markerFeature, markerFeature2]);


}