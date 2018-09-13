import { html } from "ol3-fun/index";

import "./activate";
import "./docking";
import "./multi";
import "./overlay";
import "./paging";
import "./style-offset";
import "./simple";

export function run() {
	let l = window.location;
	let path = `${l.origin}${l.pathname}?run=examples/`;
	let labs = `
    activate
    docking
    multi    
    overlay
    paging
    simple
    index
    `;

	let markup = labs
		.split(/ /)
		.map(v => v.trim())
		.filter(v => !!v)
		.sort()
		.map(lab => `<a href="${path}${lab}&debug=1">${lab}</a>`)
		.join("<br/>");

	document.body.appendChild(html(`<div>${markup}</div>`));
}
