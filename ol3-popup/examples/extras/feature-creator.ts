import ol = require("openlayers");
import Symbolizer = require("ol3-symbolizer");

const symbolizer = new Symbolizer.StyleConverter();

function setStyle(feature: ol.Feature, json: Symbolizer.Format.Style) {
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

        map.on("click", event => {
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

}

export = FeatureCreator;