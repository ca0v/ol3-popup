import ol = require("openlayers");
let style = [
	{
		"circle": {
			"fill": {
				"gradient": {
					"type": "radial(25,25,21,25,25,0)",
					"stops": "rgba(185,7,126,0.66) 0%;rgba(171,23,222,0.29) 100%"
				}
			},
			"opacity": 1,
			"stroke": {
				"color": "rgba(5,105,56,0.97)",
				"width": 4
			},
			"radius": 21,
			"rotation": 0
		}
	}
];

export = style;
