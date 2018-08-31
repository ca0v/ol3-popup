import "./activate";
import "./docking";
import "./flash-style";
import "./multi";
import "./overlay";
import "./paging";
import "./style-offset";
import "./simple";

export function run() {
    let l = window.location;
    let path = `${l.origin}${l.pathname}?run=examples/`;
    let labs = `
    overlay
    simple
    multi
    docking
    index
    `;
    
    document.writeln(`
    <p>
    Watch the console output for failed assertions (blank is good).
    </p>
    `);

    document.writeln(labs
        .split(/ /)
        .map(v => v.trim())
        .filter(v => !!v)
        .sort()
        .map(lab => `<a href="${path}${lab}&debug=1">${lab}</a>`)
        .join("<br/>"));
    
};
