import ol = require("openlayers");
import { Popup } from "../ol3-popup";
import Symbolizer = require("ol3-symbolizer");
import { cssin, html as asHtml } from "ol3-fun/ol3-fun/common";

const symbolizer = new Symbolizer.StyleConverter();

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
<div class="map"></div>
`;

const center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');

function setStyle(feature: ol.Feature, json: Symbolizer.Format.Style) {
    let style = symbolizer.fromJson(json);
    feature.setStyle(style);
    return style;
}

function addSomeFeatures(vectorLayer: ol.layer.Vector) {
    let circleFeature = new ol.Feature({
        id: 123,
        foo: "foo",
        bar: "bar",
    });
    circleFeature.setGeometry(new ol.geom.Point(center));

    setStyle(circleFeature, {
        "circle": {
            "fill": {
                "color": "rgba(128,0,0,0.90)"
            },
            "opacity": 1,
            "stroke": {
                "color": "rgba(0,0,0,0.5)",
                "width": 2
            },
            "radius": 10
        }
    });

    let svgFeature = new ol.Feature({
        id: 123,
        foo: "foo",
        bar: "bar",
    });
    svgFeature.setGeometry(new ol.geom.Point([center[0] + 1000, center[1]]));
    setStyle(svgFeature, {
        "image": {
            "imgSize": [36, 36],
            "anchor": [32, 32],
            "stroke": {
                "color": "rgba(128,25,0,0.8)",
                "width": 10
            },
            "path": "M23 2 L23 23 L43 16.5 L23 23 L35 40 L23 23 L11 40 L23 23 L3 17 L23 23 L23 2 Z"
        }
    });

    let markerFeature = new ol.Feature({
        id: 123,
        foo: "foo",
        bar: "bar",
    });


    markerFeature.setGeometry(new ol.geom.Polygon([[
        [center[0] + 1000, center[1] + 1000],
        [center[0] + 1000 * Math.random(), center[1] + 1000 * Math.random()],
        [center[0] + 100 * Math.random(), center[1] + 100 * Math.random()],
        [center[0] + 100 + 1000 * Math.random(), center[1] + 100 + 100 * Math.random()],
        [center[0] + 1000, center[1] + 1000]
    ]]));
    setStyle(markerFeature, {
        "fill": {
            "color": "rgba(255,255,0,1)",
        },
        "stroke": {
            "color": "rgba(0,255,0,1)",
            "width": 1
        }
    });

    let markerFeature2 = new ol.Feature({
        id: 123,
        foo: "foo",
        UserIdentification: "foo.bar@foobar.org",
    });
    markerFeature2.setGeometry(new ol.geom.Point([center[0], center[1] + 1000]));
    setStyle(markerFeature2, {
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

    vectorLayer.getSource().addFeatures([circleFeature, svgFeature, markerFeature, markerFeature2]);
}

export function run() {

    cssin("simple", css);
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
            center: center,
            zoom: 16
        })
    });

    Popup.create({
        map: map,
        // shift+click multi-selects
        multi: true,
        // white background, border, etc.
        css: popupCss,
        // render selected features w/ red dot and number
        pagingStyle: (feature: ol.Feature, resolution: number, pageIndex: number) => {
            return symbolizer.fromJson({
                "circle": {
                    "fill": {
                        "color": "rgba(255,0,0,1)"
                    },
                    "opacity": 1,
                    "stroke": {
                        "color": "rgba(255,255,255,1)",
                        "width": 1
                    },
                    "radius": 3
                },

                text: {
                    text: `${pageIndex + 1}`,
                    fill: {
                        color: "white",
                    },
                    stroke: {
                        color: "black",
                        width: 2
                    },
                    "offset-y": 10
                }
            });
        },
        asContent: (feature: ol.Feature) => {
            let div = document.createElement("div");

            let keys = Object.keys(feature.getProperties()).filter(key => {
                let v = feature.get(key);
                if (typeof v === "string") return true;
                if (typeof v === "number") return true;
                return false;
            });
            div.title = feature.getGeometryName();
            div.innerHTML = `<table>${keys.map(k => `<tr><td><b>${k}</b></td><td><i>${feature.get(k)}</i></td></tr>`).join("")}</table>`;

            return div;
        },
    });

    let vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    map.addLayer(vectorLayer);

    addSomeFeatures(vectorLayer);
}