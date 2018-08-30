import ol = require("openlayers");
import { cssin, html as asHtml, pair } from "ol3-fun/ol3-fun/common";

import { Popup } from "../ol3-popup/ol3-popup";

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

    {
        let overlay = new ol.Overlay({
            autoPan: true,
            position: center,
            positioning: "center-center",
            element: asHtml(`<div border="1px solid red">❌</div>`),
        });
        map.addOverlay(overlay);
    }

    let popup = Popup.create({
        map: map,
        pointerPosition: 12,
        autoPan: true,
        positioning: "bottom-center",
    });

    if (1) {
        setTimeout(() => {
            popup.show(center, "simple popup")
        }, 1000);

    } else {
        {
            let overlay = new ol.Overlay({
                autoPan: true,
                position: center,
                positioning: "bottom-center",
                element: asHtml(`<div style="text-align: center"><div class="simple-popup">Overlay with positioning set to bottom-center</div><span class="simple-popup-down-arrow"></span></div>`),
            });
            map.addOverlay(overlay);
            setTimeout(() => map.removeOverlay(overlay), 1000);
        }

        {
            let overlay = new ol.Overlay({
                autoPan: true,
                position: center,
                positioning: "top-center",
                element: asHtml(`<div style="text-align: center"><span class="simple-popup-up-arrow"></span><div class="simple-popup">Overlay with positioning set to top-center</div>`),
            });
            map.addOverlay(overlay);
            setTimeout(() => map.removeOverlay(overlay), 1000);
        }

        setTimeout(() => {
            popup.options.autoPositioning = false;
            let original = popup.getPositioning();
            let items = pair("top,center,bottom".split(","), "left,center,right".split(","));
            let h = setInterval(() => {
                let positioning: string;
                if (!items.length) {
                    clearInterval(h);
                    popup.options.autoPositioning = true;
                    positioning = original;
                } else {
                    positioning = items.pop().join("-");
                }
                popup.setPositioning(<any>positioning);
                popup.show(center, positioning);
            }, 1000);
        }, 1000);

    }
}