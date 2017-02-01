//import "xstyle/css!ol3-popup/css/ol3-popup.css";
import ol = require("openlayers");
import Popup = require("../ol3-popup");
import FeatureCreator = require("../extras/feature-creator");
import FeatureSelector = require("../extras/feature-selector");

import $ = require("jquery");

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

const css_popup = `
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

.dock-container {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 200px;
    height: 300px;
    border: 1px solid rgba(0,0,0,0.1);
    display: inline-block;
    padding: 20px;
    background: transparent;
    pointer-events: none;
}

.ol-popup {
    min-width: 200px;
    min-height: 50px;
    background: white;
    color: black;
}

.ol-popup:after {
    border-top-color: white;
}

.ol-popup .ol-popup-content {
    padding: 0;
}

.ol-popup .ol-popup-content > *:first-child {
    margin-right: 36px;
    overflow: hidden;
    border-bottom: 1px solid black;
    display: block;
}

.ol-popup .pagination button {
    border:none;
    background:transparent;
}

`;

const html = `
<div class="map"></div>
<div class='dock-container'></div>
`;

const sample_content = [
    'The story of the three little pigs...',
    'This little piggy went to market',
    'This little piggy stayed home',
    'This little piggy had roast beef',
    'This little piggy had none',
    'And this little piggy, <br/>this wee little piggy, <br/>when wee, wee, wee, wee <br/>all the way home!',
];

let center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');


export function run() {

    $(`<style name="paging" type='text/css'>${css}</style>`).appendTo('head');
    $(`<div>${html}</div>`).appendTo('body');

    let mapContainer = $(".map")[0];
    let dockContainer = $(".dock-container")[0];

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
        autoPanMargin: 20,
        autoPanAnimation: {
            source: null,
            duration: 500
        },
        pointerPosition: 100,
        yOffset: 10,
        css: css_popup,
        dockContainer: dockContainer
    });

    map.addOverlay(popup);
    popup.on("show", () => console.log(`show popup`));
    popup.on("hide", () => console.log(`hide popup`));
    popup.pages.on("goto", () => console.log(`goto page: ${popup.pages.activeIndex}`));

    [1, 2, 3].map(i => popup.pages.add(`Page ${i}`, new ol.geom.Point(center)));

    popup.pages.goto(0);

    setTimeout(() => {
        popup.show(center, "<div>Click the map to see a popup</div>");
        let pages = 0;
        console.log("adding 5 pages");
        let h = setInterval(() => {
            if (++pages === 5) {
                console.log("detaching from map (docking)");
                clearInterval(h);
                popup.dock();
                let h2 = popup.on("hide", () => {
                    popup.unByKey(h2);
                    popup.undock();
                });
                setTimeout(() => {
                    console.log("re-attaching to map (un-docking)");
                    popup.undock();

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
                    {
                        let message = `
This function promise resolves to a div element.
<br/>
This page was resolved after 3 seconds.  
<br/>As the content of this page grows, 
<br/>you should notice that the PanIntoView is continually keeping the popup within view.
<br/>`;

                        popup.pages.add(() => {
                            let index = 0;
                            let d = $.Deferred();
                            let div = document.createElement("div");
                            let body = document.createElement("div");
                            body.appendChild(div);

                            setTimeout(() => d.resolve(body), 3000);

                            d.then(body => {
                                let h = setInterval(() => {
                                    div.innerHTML = `<p>${message.substr(0, ++index)}</p>`;
                                    popup.panIntoView();
                                    if (index >= message.length) clearInterval(h);
                                }, 100);
                            });

                            return d;
                        });
                    }

                }, 1000);
            }
            let div = document.createElement("div");
            div.innerHTML = `PAGE ${pages}<br/>${sample_content[pages % sample_content.length]}`;
            popup.pages.add(div);
        }, 200);
    }, 500);

    let selector = new FeatureSelector({
        map: map,
        popup: popup,
        title: "<b>Alt+Click</b> creates markers",
    });

    new FeatureCreator({
        map: map
    });

}