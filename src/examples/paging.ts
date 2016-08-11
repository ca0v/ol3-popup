import ol = require("openlayers");
import Popup = require("../ol3-popup");
import FeatureCreator = require("./extras/feature-creator");
import FeatureSelector = require("./extras/feature-selector");

import $ = require("jquery");

const sample_content = [
    'The story of the three little pigs...',
    'This little piggy went to market',
    'This little piggy stayed home',
    'This little piggy had roast beef',
    'This little piggy had none',
    'And this little piggy, <br/>this wee little piggy, <br/>when wee, wee, wee, wee <br/>all the way home!',
];

let center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');

let mapContainer = document.getElementById("map");

export function run() {
    let map = new ol.Map({
        target: mapContainer,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: center,
            zoom: 6
        })
    });

    let popup = new Popup.Popup({
        autoPan: true,
        autoPanMargin: 100,
        autoPanAnimation: {
            duration: 2000
        }
    });
    map.addOverlay(popup);
    popup.on("show", () => console.log(`show popup`));
    popup.on("hide", () => console.log(`hide popup`));
    popup.pages.on("goto", () => console.log(`goto page: ${popup.pages.activeIndex}`));

    setTimeout(() => {
        popup.show(center, "<div>Click the map to see a popup</div>");
        let pages = 0;
        console.log("adding 5 pages");
        let h = setInterval(() => {
            if (++pages === 5) {
                console.log("detaching from map (docking)");
                clearInterval(h);
                let attach = popup.detach();
                let h2 = popup.on("hide", () => {
                    popup.unByKey(h2);
                    attach.off();
                });
                setTimeout(() => {
                    console.log("re-attaching to map (un-docking)");
                    attach.off();

                    console.log("adding a page with string and dom promise");
                    {
                        let d1 = $.Deferred();
                        popup.pages.add(d1);
                        setTimeout(() => d1.resolve('<p>This promise resolves to a string<p>'), 500);

                        let d2 = $.Deferred();
                        popup.pages.add(d2);
                        let div = document.createElement("div");
                        div.innerHTML = '<p>This function promise resolves to a div element</p>';
                        setTimeout(() => d2.resolve(div), 100);
                    }

                    console.log("adding a page with a string callback");
                    popup.pages.add(() => '<p>This function returns a string</p>');

                    console.log("adding a page with a dom callback");
                    popup.pages.add(() => {
                        let div = document.createElement("div");
                        div.innerHTML = '<p>This function returns a div element</p>';
                        return div;
                    });

                    console.log("adding a page with a string-promise");
                    popup.pages.add(() => {
                        let d = $.Deferred();
                        d.resolve('<p>This function promise resolves to a string</p>');
                        return d;
                    });

                    console.log("adding a page with a dom-promise");
                    let version = 1;
                    popup.pages.add(() => {
                        let d = $.Deferred();
                        let div = document.createElement("div");
                        let markup = `<p>This function promise resolves to a div element, watch the version change 1 second after visiting this page.</p><p>Version: ${version++}</p>`;
                        setInterval(() => div.innerHTML = `${markup}<p>Timestamp: ${new Date().toISOString()}<p/>`, 100);
                        setTimeout(() => d.resolve(div), 1000);
                        return d;
                    });

                    popup.pages.goto(popup.pages.count - 1);

                }, 1000);
            }
            let div = document.createElement("div");
            div.innerHTML = `PAGE ${pages}<br/>${sample_content[pages % sample_content.length]}`;
            popup.pages.add(div);
            popup.pages.goto(0);
        }, 200);
    }, 500);

    let selector = new FeatureSelector({
        map: map,
        popup: popup,
        title: "Alt+Click creates markers",
    });

    new FeatureCreator({
        map: map
    });

}