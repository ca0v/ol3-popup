import ol = require("openlayers");
import { Popup } from "../ol3-popup";
import Symbolizer = require("ol3-symbolizer");
import { cssin, html as asHtml } from "ol3-fun/ol3-fun/common";

const symbolizer = new Symbolizer.StyleConverter();

function setStyle(feature: ol.Feature, json: Symbolizer.Format.Style) {
    let style = symbolizer.fromJson(json);
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
                    stroke: {
                        color: "white",
                        width: 2
                    },
                    "offset-y": 20
                }
            });
        }
    });

    let vectorSource = new ol.source.Vector({
        features: []
    });

    let vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: (f: ol.Feature, res: number) => <ol.style.Style>f.getStyle()
    });

    map.addLayer(vectorLayer);

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
    markerFeature.setGeometry(new ol.geom.Point([center[0] + 1000, center[1] + 1000]));
    setStyle(markerFeature, {
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

    vectorSource.addFeatures([circleFeature, svgFeature, markerFeature, markerFeature2]);


}