import ol = require("openlayers");
import { describe, it, should, shouldEqual } from "ol3-fun/tests/base";
import { Popup } from "../../index";

describe("spec/popup-content", () => {
	it("asContent returns a DOM node with content", () => {
		let popup = Popup.create({ autoPopup: false });
		let feature = new ol.Feature({ name: "Feature Name" });
		let html = popup.options.asContent(feature);
		should(0 < html.outerHTML.indexOf("Feature Name"), "Feature Name");
		shouldEqual(
			`<table><tbody><tr><td>name</td><td>Feature Name</td></tr></tbody></table>`,
			html.innerHTML,
			"popup markup"
		);
	});
});
