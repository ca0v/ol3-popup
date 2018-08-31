import ol = require("openlayers");
import { Symbolizer, Format as SymbolizerFormat } from "ol3-symbolizer/index";

const symbolizer = new Symbolizer.StyleConverter();

function random(center: ol.Coordinate, scale = 1000): ol.Coordinate {
    return [center[0] + scale * Math.random(), center[1] + scale * Math.random()];
}

function translate(center: ol.Coordinate, t: ol.Coordinate): ol.Coordinate {
    return [center[0] + t[0], center[1] + t[1]];
}

function setStyle(feature: ol.Feature, json: SymbolizerFormat.Style) {
    let style = symbolizer.fromJson(json);
    feature.setStyle(style);
    return style;
}

/**
 * Used for testing, will create features when Alt+Clicking the map
 */
class FeatureCreator {

    static create(options: {
        map: ol.Map;
    }) {
        return new FeatureCreator(options);
    }

    constructor(public options: {
        map: ol.Map;
    }) {

        let map = options.map;

        let vectorSource = new ol.source.Vector({
            features: []
        });

        let vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });

        map.addLayer(vectorLayer);

        map.on("click", (event: ol.MapBrowserEvent) => {
            if (!ol.events.condition.altKeyOnly(event)) return;

            event = event["mapBrowserEvent"] || event;
            let coord = event.coordinate;
            let geom = new ol.geom.Point(coord);
            let feature = new ol.Feature({
                geometry: geom,
                name: "New Feature",
                attributes: {}
            });
            vectorSource.addFeature(feature);
        });

    }

    addSomeFeatures(vectorLayer: ol.layer.Vector, center: ol.Coordinate) {

        let circleFeature = new ol.Feature({
            id: 123,
            foo: "foo",
            bar: "bar",
        });
        circleFeature.setGeometry(new ol.geom.Point(random(center, 100)));

        let style: SymbolizerFormat.Style = {
            "circle": {
                "fill": {
                    "color": "rgba(255,0,0,0.90)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(0,0,0,1)",
                    "width": 1
                },
                "radius": 6
            }
        };
        setStyle(circleFeature, style);

        let svgFeature = new ol.Feature({
            id: 123,
            foo: "foo",
            bar: "bar",
        });
        svgFeature.setGeometry(new ol.geom.Point(random(translate(center, [1000, 0]))));
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


        let triangle1 = random(translate(center, [1000, 1000]));
        markerFeature.setGeometry(new ol.geom.Polygon([[
            triangle1,
            random(center, 1000),
            random(center, 1000),
            triangle1
        ]]));

        setStyle(markerFeature, {
            "fill": {
                "color": "rgba(255,255,0, 0.8)",
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
        markerFeature2.setGeometry(new ol.geom.Point(random(translate(center, [0, 1000]))));
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

        vectorLayer.getSource().addFeatures([
            circleFeature,
            svgFeature,
            markerFeature,
            markerFeature2
        ]);

        return this;
    }

}

export = FeatureCreator;