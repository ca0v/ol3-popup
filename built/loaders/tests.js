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
        url = url || window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var test = getParameterByName("test") || "tests/index";
    var debug = getParameterByName("debug") === "1";
    var localhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    var dark = getParameterByName("theme") === "dark";
    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("verbose", !localhost);
    document.body.classList.toggle("light", !dark);
    document.body.classList.toggle("terse", localhost && !debug);
    loadCss(localhost ? "../node_modules/mocha/mocha.css" : "https://cdnjs.cloudflare.com/ajax/libs/mocha/5.2.0/mocha.css");
    loadCss(localhost
        ? "../node_modules/ol3-fun/static/ol/v5.1.3/ol.css"
        : "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/css/ol.css");
    // setup require js packaging system and load the "spec" before running mocha
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
                location: localhost ? "../../node_modules/jquery" : "https://code.jquery.com",
                main: localhost ? "dist/jquery.min" : "jquery-3.3.1.min"
            },
            {
                name: "mocha",
                location: localhost ? "../../node_modules/mocha" : "https://cdnjs.cloudflare.com/ajax/libs/mocha/5.2.0",
                main: localhost ? "mocha" : "mocha.min"
            }
        ],
        deps: ["../tests.max"],
        callback: function () {
            requirejs(["mocha"], function () {
                // window.Mocha is a
                var Mocha = window["mocha"];
                var mocha = Mocha.setup({
                    timeout: 5000,
                    ui: "bdd",
                    bail: debug
                });
                console.log(mocha);
                // mocha is putting out globals...hide them (should only be when running as CLI so not sure what's happening)
                define("mocha", [], function () { return ({ describe: describe, it: it }); });
                // execute "describe" and "it" methods before running mocha
                requirejs(test.split(","), function () { return mocha.run(); });
            });
        }
    });
})();
