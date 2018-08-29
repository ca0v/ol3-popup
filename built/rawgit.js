(function () {
    function getParameterByName(name, url) {
        url = url || window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var debug = getParameterByName("debug") === "1";
    var localhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (localhost && !debug)
        debug = getParameterByName("debug") !== "0";
    var deps = [debug ? "built/index.max" : "built/index.max"];
    deps.push("xstyle/css!openlayers/css/ol.css");
    if (typeof Path2D !== 'function')
        deps.push("https://rawgit.com/google/canvas-5-polyfill/0.1.1/canvas.js");
    require.config({
        shim: {
            // no need to wrap ol in a define method when using a shim
            // build this using the "npm run build-legacy" (see ol package.json)
            "openlayers": {
                deps: [],
                exports: "ol"
            }
        },
        paths: {
            "openlayers": localhost ? "./static/ol/v5.1.3/ol" : "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/build/ol"
        },
        packages: [
            {
                name: 'ol3-popup',
                location: './built'
            },
            {
                name: 'xstyle',
                location: localhost ? "./node_modules/xstyle" : 'https://cdn.rawgit.com/kriszyp/xstyle/v0.3.2',
                main: debug ? 'xstyle' : 'xstyle'
            },
            {
                name: 'jquery',
                location: localhost ? "./node_modules/jquery/dist" : 'https://cdn.rawgit.com/jquery/jquery-dist/3.1.1/dist',
                main: debug ? 'jquery' : 'jquery.min'
            }
        ],
        deps: deps,
        callback: function () {
            require([getParameterByName("run") || "ol3-popup/examples/index"], function (test) { test.run(); });
        }
    });
})();
