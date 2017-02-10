import ol = require("openlayers");
import { Popup } from "../ol3-popup";

/**
 * Interaction which opens the popup when zero or more features are clicked
 */
class FeatureSelector {

    constructor(public options: {
        map: ol.Map;
        popup: Popup;
        title: string;
    }) {

        let map = options.map;

        map.on("click", event => {
            console.log("click");
            let popup = options.popup;
            let coord = event.coordinate;
            popup.hide();

            let pageNum = 0;
            map.forEachFeatureAtPixel(event.pixel, (feature: ol.Feature, layer) => {
                let page = document.createElement('p');
                page.innerHTML = `Page ${++pageNum} ${feature.getGeometryName()}`;
                popup.pages.add(page, feature.getGeometry());
            });

            if (!pageNum) {
                popup.show(coord, `<label>${this.options.title}</label>`);
            } else {
                popup.pages.goto(0);
            }
        });

    }
}

export = FeatureSelector;