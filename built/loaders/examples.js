"use strict";
(function () {
    function loadCss(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    function getParameterByName(name, url) {
        if (url === void 0) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var debug = getParameterByName("debug") === "1";
    var localhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    document.body.classList.toggle("dark", localhost && !debug);
    document.body.classList.toggle("verbose", debug);
    document.body.classList.toggle("light", !localhost || debug);
    document.body.classList.toggle("terse", !debug);
    loadCss(localhost
        ? "../node_modules/ol3-fun/static/ol/v5.1.3/ol.css"
        : "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/css/ol.css");
    requirejs.config({
        shim: {
            // no need to wrap ol in a define method when using a shim
            // build this using the "npm run build-legacy" (see ol package.json)
            openlayers: {
                deps: [],
                exports: "ol" // tell requirejs which global this library defines
            }
        },
        paths: {
            openlayers: localhost
                ? "../../node_modules/ol3-fun/static/ol/v5.1.3/ol"
                : "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/build/ol"
        },
        packages: [
            {
                name: "jquery",
                location: localhost
                    ? "../../node_modules/jquery/dist"
                    : "https://cdn.rawgit.com/jquery/jquery-dist/3.1.1/dist",
                main: "jquery.min"
            }
        ],
        deps: ["../examples.max"],
        callback: function () { return requirejs([getParameterByName("run") || "examples/index"], function (test) { return test.run(); }); }
    });
})();
