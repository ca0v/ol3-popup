//import "xstyle/css!ol3-popup/css/ol3-popup.css";
import ol = require("openlayers");
export function MapMaker(mapContainer: HTMLDivElement) {
	return new ol.Map({
		target: mapContainer,
		layers: [],
		view: new ol.View({
			center: [0, 0],
			zoom: 6
		})
	});
}
