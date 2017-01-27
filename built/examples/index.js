define(["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=examples/";
        var labs = "\n    paging\n    index\n    ";
        document.writeln("\n    <p>\n    Watch the console output for failed assertions (blank is good).\n    </p>\n    ");
        document.writeln(labs
            .split(/ /)
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return !!v; })
            .sort()
            .map(function (lab) { return ("<a href=" + path + lab + "&debug=1>" + lab + "</a>"); })
            .join("<br/>"));
    }
    exports.run = run;
    ;
});
//# sourceMappingURL=index.js.map