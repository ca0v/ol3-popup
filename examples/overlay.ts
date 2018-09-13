import ol = require("openlayers");
import { cssin, html as asHtml, pair } from "ol3-fun/ol3-fun/common";

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

.ol-control.simple-infobox {
    top: 1em;
    left: 25%;
    max-width: 50%;
  }

.simple-popup {
    border: 1px solid black;
    border-radius: 4px;
    padding: 10px;
    background-color: rgba(80, 80, 80, 0.5);
    color: rgb(250, 250, 250);
    max-width: 120px;
}

.simple-popup-arrow {
    color: black;
    font-size: 36px;
}

.simple-popup-down-arrow:after {
    content: "⇩";
    position: relative;
    top: -8px;
}

.simple-popup-up-arrow:after {
    content: "⇧";
    position: relative;
    top: 10px;
}

.simple-popup-left-arrow:after {
    content: "⇦";
}

.simple-popup-right-arrow:after {
    content: "⇨";
}

`;

const html = `
<div class="map"></div>
`;

const center = ol.proj.transform([-85, 35], 'EPSG:4326', 'EPSG:3857');


export function run() {

    cssin("simple", css);

    document.body.appendChild(asHtml(`<div>${html}</div>`));

    let vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    let map = new ol.Map({
        target: document.getElementsByClassName("map")[0],
        layers: [vectorLayer],
        view: new ol.View({
            projection: "EPSG:3857",
            center: center,
            zoom: 16
        })
    });

    {
        let message = "the purpose of this example is to show the techniques and complexities of creating a popup control";
        map.addControl(new ol.control.Control({
            element: asHtml(`<div class="simple-infobox ol-unselectable ol-control"><label>${message}</label></div>`),
        }));
    }

    let marker = new ol.Overlay({
        autoPan: true,
        position: center,
        positioning: "center-center",
        element: asHtml(`<div class="ol-unselectable" border="1px solid red">❌</div>`),
    });
    map.addOverlay(marker);

    let topOverlay = new ol.Overlay({
        autoPan: true,
        position: center,
        positioning: "bottom-center",
        element: asHtml(`<div class="ol-unselectable" style="text-align: center"><div class="simple-popup">Overlay with positioning set to bottom-center</div><span class="simple-popup-arrow simple-popup-down-arrow"></span></div>`),
    });
    map.addOverlay(topOverlay);

    let bottomOverlay = new ol.Overlay({
        autoPan: true,
        position: center,
        positioning: "top-center",
        element: asHtml(`<div class="ol-unselectable" style="text-align: center"><span class="simple-popup-arrow simple-popup-up-arrow"></span><div class="simple-popup">Overlay with positioning set to top-center</div>`),
    });
    map.addOverlay(bottomOverlay);

}