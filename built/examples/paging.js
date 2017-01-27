define(["require", "exports", "openlayers", "../ol3-popup", "../extras/feature-creator", "../extras/feature-selector", "jquery", "xstyle/css!css/ol3-popup.css"], function (require, exports, ol, Popup, FeatureCreator, FeatureSelector, $) {
    "use strict";
    var css = "\nhead, body {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.map {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n.dock-container {\n    position: absolute;\n    top: 20px;\n    right: 20px;\n    width: 200px;\n    height: 300px;\n    border: 1px solid rgba(0,0,0,0.1);\n    display: inline-block;\n    padding: 20px;\n    background: transparent;\n    pointer-events: none;\n}\n\n.ol-popup {\n    min-width: 100px;\n    min-height: 50px;\n    background: black;\n    color: gold;\n}\n\n.ol-popup .ol-popup-content {\n    padding: 0;\n}\n\n.ol-popup .ol-popup-content > *:first-child {\n    margin-right: 36px;\n    overflow: hidden;\n    border-bottom: 1px solid black;\n    display: block;\n}\n\n";
    var html = "\n<div class=\"map\"></div>\n<div class='dock-container'></div>\n";
    var sample_content = [
        'The story of the three little pigs...',
        'This little piggy went to market',
        'This little piggy stayed home',
        'This little piggy had roast beef',
        'This little piggy had none',
        'And this little piggy, <br/>this wee little piggy, <br/>when wee, wee, wee, wee <br/>all the way home!',
    ];
    var center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');
    function run() {
        $("<style type='text/css'>" + css + "</style>").appendTo('head');
        $("<div>" + html + "</div>").appendTo('body');
        var mapContainer = $(".map")[0];
        var dockContainer = $(".dock-container")[0];
        var map = new ol.Map({
            target: mapContainer,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: center,
                zoom: 6
            })
        });
        var popup = new Popup.Popup({
            autoPan: true,
            autoPanMargin: 20,
            autoPanAnimation: {
                source: null,
                duration: 500
            },
            dockContainer: dockContainer
        });
        map.addOverlay(popup);
        popup.on("show", function () { return console.log("show popup"); });
        popup.on("hide", function () { return console.log("hide popup"); });
        popup.pages.on("goto", function () { return console.log("goto page: " + popup.pages.activeIndex); });
        [1, 2, 3].map(function (i) { return popup.pages.add("Page " + i, new ol.geom.Point(center)); });
        popup.pages.goto(0);
        setTimeout(function () {
            popup.show(center, "<div>Click the map to see a popup</div>");
            var pages = 0;
            console.log("adding 5 pages");
            var h = setInterval(function () {
                if (++pages === 5) {
                    console.log("detaching from map (docking)");
                    clearInterval(h);
                    popup.dock();
                    var h2_1 = popup.on("hide", function () {
                        popup.unByKey(h2_1);
                        popup.undock();
                    });
                    setTimeout(function () {
                        console.log("re-attaching to map (un-docking)");
                        popup.undock();
                        console.log("adding a page with string and dom promise");
                        {
                            var d1_1 = $.Deferred();
                            popup.pages.add(d1_1);
                            setTimeout(function () { return d1_1.resolve('<p>This promise resolves to a string<p>'); }, 500);
                            var d2_1 = $.Deferred();
                            popup.pages.add(d2_1);
                            var div_1 = document.createElement("div");
                            div_1.innerHTML = '<p>This function promise resolves to a div element</p>';
                            setTimeout(function () { return d2_1.resolve(div_1); }, 100);
                        }
                        console.log("adding a page with a string callback");
                        popup.pages.add(function () { return '<p>This function returns a string</p>'; });
                        console.log("adding a page with a dom callback");
                        popup.pages.add(function () {
                            var div = document.createElement("div");
                            div.innerHTML = '<p>This function returns a div element</p>';
                            return div;
                        });
                        console.log("adding a page with a string-promise");
                        popup.pages.add(function () {
                            var d = $.Deferred();
                            d.resolve('<p>This function promise resolves to a string</p>');
                            return d;
                        });
                        console.log("adding a page with a dom-promise");
                        {
                            var message_1 = "\nThis function promise resolves to a div element.\n<br/>\nThis page was resolved after 3 seconds.  \n<br/>As the content of this page grows, \n<br/>you should notice that the PanIntoView is continually keeping the popup within view.\n<br/>";
                            popup.pages.add(function () {
                                var index = 0;
                                var d = $.Deferred();
                                var div = document.createElement("div");
                                var body = document.createElement("div");
                                body.appendChild(div);
                                setTimeout(function () { return d.resolve(body); }, 3000);
                                d.then(function (body) {
                                    var h = setInterval(function () {
                                        div.innerHTML = "<p>" + message_1.substr(0, ++index) + "</p>";
                                        popup.panIntoView();
                                        if (index >= message_1.length)
                                            clearInterval(h);
                                    }, 100);
                                });
                                return d;
                            });
                        }
                    }, 1000);
                }
                var div = document.createElement("div");
                div.innerHTML = "PAGE " + pages + "<br/>" + sample_content[pages % sample_content.length];
                popup.pages.add(div);
            }, 200);
        }, 500);
        var selector = new FeatureSelector({
            map: map,
            popup: popup,
            title: "<b>Alt+Click</b> creates markers",
        });
        new FeatureCreator({
            map: map
        });
    }
    exports.run = run;
});
//# sourceMappingURL=paging.js.map