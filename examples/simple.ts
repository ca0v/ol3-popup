import ol = require("openlayers");
import { cssin, html as asHtml, pair, range } from "ol3-fun/ol3-fun/common";

import { Popup } from "../ol3-popup/ol3-popup";

import FeatureCreator = require("./extras/feature-creator");

const css = `
head, body, .map {
    padding: 0;
    margin: 0;
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

.simple-popup {
    border: 1px solid black;
    border-radius: 4px;
    padding: 10px;
    background-color: rgba(80, 80, 80, 0.5);
    color: rgb(250, 250, 250);
    max-width: 120px;
}

.simple-popup-down-arrow {
    color: black;
    font-size: 20px;
}

.simple-popup-down-arrow:after {
    content: "⇩";
}

.simple-popup-up-arrow {
    color: black;
    font-size: 20px;
}

.simple-popup-up-arrow:after {
    content: "⇧";
}

.simple-popup-left-arrow {
    color: black;
    font-size: 20px;
}

.simple-popup-left-arrow:after {
    content: "⇦";
}

.simple-popup-right-arrow {
    color: black;
    font-size: 20px;
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

    console.log("the purpose of this example is to show the techniques and complexities of creating a popup control");

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

    FeatureCreator
        .create({ map: map })
        .addSomeFeatures(vectorLayer, center);

    // create overlay as a marker
    map.addOverlay(new ol.Overlay({
        position: center,
        positioning: "center-center",
        element: asHtml(`<div border="1px solid red">❌</div>`),
    }));

    let popup = Popup.create({
        map: map,
        pointerPosition: 5,
        autoPan: true,
        autoPanMargin: 20,
        positioning: "bottom-center",
        autoPanAnimation: {
            source: null,
            duration: 100
        }
    });

    setTimeout(() => {
        // test autoPositioning
        let d = new Promise((resolve, reject) => {
            popup.options.autoPositioning = false;
            let original = popup.getPositioning();
            let items = pair("top,center,bottom".split(","), "left,center,right".split(","));
            let h = setInterval(() => {
                let positioning: string;
                if (!items.length) {
                    clearInterval(h);
                    popup.options.autoPositioning = true;
                    positioning = original;
                    resolve();
                } else {
                    positioning = items.pop().join("-");
                }
                popup.setPositioning(<any>positioning);
                popup.show(center, positioning);
            }, 200);
        });

        // show popup in key locations
        d.then(() => {
            map.getView().setZoom(map.getView().getZoom() + 1);
            let size = map.getSize();
            let count = 5;
            let [dx, dy] = size.map(sz => range(count).map(n => sz * n / (count - 1)));
            let coords = pair(dx, dy).map(p => map.getCoordinateFromPixel(p));
            let h = setInterval(() => {
                if (!coords.length) {
                    clearInterval(h);
                    return;
                }
                let c = coords.pop();
                popup.show(c, `${c.map(n => Math.floor(n))}<br/>${coords.length} remaining`);
            }, 1000);
        });

    }, 500);

}