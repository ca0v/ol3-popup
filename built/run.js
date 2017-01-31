var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("examples/flash-style", ["require", "exports"], function (require, exports) {
    "use strict";
    var style = [
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
    return style;
});
define("examples/index", ["require", "exports"], function (require, exports) {
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
define("paging/paging", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function getInteriorPoint(geom) {
        if (geom["getInteriorPoint"])
            return geom["getInteriorPoint"]().getCoordinates();
        return ol.extent.getCenter(geom.getExtent());
    }
    /**
     * Collection of "pages"
     */
    var Paging = (function () {
        function Paging(options) {
            this.options = options;
            this._pages = [];
            this.domNode = document.createElement("div");
            this.domNode.classList.add("pages");
            options.popup.domNode.appendChild(this.domNode);
        }
        Object.defineProperty(Paging.prototype, "activeIndex", {
            get: function () {
                return this._activeIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paging.prototype, "count", {
            get: function () {
                return this._pages.length;
            },
            enumerable: true,
            configurable: true
        });
        Paging.prototype.dispatch = function (name) {
            this.domNode.dispatchEvent(new Event(name));
        };
        Paging.prototype.on = function (name, listener) {
            this.domNode.addEventListener(name, listener);
        };
        Paging.prototype.add = function (source, geom) {
            if (false) {
            }
            else if (typeof source === "string") {
                var page = document.createElement("div");
                page.innerHTML = source;
                this._pages.push({
                    element: page.firstChild,
                    location: geom && getInteriorPoint(geom)
                });
            }
            else if (source["appendChild"]) {
                var page = source;
                page.classList.add("page");
                this._pages.push({
                    element: page,
                    location: geom && getInteriorPoint(geom)
                });
            }
            else if (source["then"]) {
                var d = source;
                var page_1 = document.createElement("div");
                page_1.classList.add("page");
                this._pages.push({
                    element: page_1,
                    location: geom && getInteriorPoint(geom)
                });
                $.when(d).then(function (v) {
                    if (typeof v === "string") {
                        page_1.innerHTML = v;
                    }
                    else {
                        page_1.appendChild(v);
                    }
                });
            }
            else if (typeof source === "function") {
                // response can be a DOM, string or promise            
                var page = document.createElement("div");
                page.classList.add("page");
                this._pages.push({
                    callback: source,
                    element: page,
                    location: geom && getInteriorPoint(geom)
                });
            }
            else {
                throw "invalid source value: " + source;
            }
            this.dispatch("add");
        };
        Paging.prototype.clear = function () {
            var activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
            this._activeIndex = -1;
            this._pages = [];
            if (activeChild) {
                this.domNode.removeChild(activeChild.element);
                this.dispatch("clear");
            }
        };
        Paging.prototype.goto = function (index) {
            var _this = this;
            var page = this._pages[index];
            if (page) {
                var activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
                if (activeChild) {
                    this.domNode.removeChild(activeChild.element);
                }
                var d_1 = $.Deferred();
                if (page.callback) {
                    var refreshedContent = page.callback();
                    $.when(refreshedContent).then(function (v) {
                        if (false) {
                        }
                        else if (typeof v === "string") {
                            page.element.innerHTML = v;
                        }
                        else if (typeof v["innerHTML"] !== "undefined") {
                            page.element.innerHTML = "";
                            page.element.appendChild(v);
                        }
                        else {
                            throw "invalid callback result: " + v;
                        }
                        d_1.resolve();
                    });
                }
                else {
                    d_1.resolve();
                }
                d_1.then(function () {
                    _this.domNode.appendChild(page.element);
                    _this._activeIndex = index;
                    if (page.location) {
                        _this.options.popup.setPosition(page.location);
                    }
                    _this.dispatch("goto");
                });
            }
        };
        Paging.prototype.next = function () {
            (0 <= this.activeIndex) && (this.activeIndex < this.count) && this.goto(this.activeIndex + 1);
        };
        Paging.prototype.prev = function () {
            (0 < this.activeIndex) && this.goto(this.activeIndex - 1);
        };
        return Paging;
    }());
    exports.Paging = Paging;
});
define("paging/page-navigator", ["require", "exports"], function (require, exports) {
    "use strict";
    var classNames = {
        prev: 'btn-prev',
        next: 'btn-next',
        hidden: 'hidden',
        active: 'active',
        inactive: 'inactive',
        pagenum: "page-num"
    };
    var eventNames = {
        show: "show",
        hide: "hide",
        prev: "prev",
        next: "next"
    };
    /**
     * The prior + next paging buttons and current page indicator
     */
    var PageNavigator = (function () {
        function PageNavigator(options) {
            var _this = this;
            this.options = options;
            var pages = options.pages;
            this.domNode = document.createElement("div");
            this.domNode.classList.add("pagination");
            this.domNode.innerHTML = this.template();
            this.prevButton = this.domNode.getElementsByClassName(classNames.prev)[0];
            this.nextButton = this.domNode.getElementsByClassName(classNames.next)[0];
            this.pageInfo = this.domNode.getElementsByClassName(classNames.pagenum)[0];
            pages.options.popup.domNode.appendChild(this.domNode);
            this.prevButton.addEventListener('click', function () { return _this.dispatch(eventNames.prev); });
            this.nextButton.addEventListener('click', function () { return _this.dispatch(eventNames.next); });
            pages.on("goto", function () { return pages.count > 1 ? _this.show() : _this.hide(); });
            pages.on("clear", function () { return _this.hide(); });
            pages.on("goto", function () {
                var index = pages.activeIndex;
                var count = pages.count;
                var canPrev = 0 < index;
                var canNext = count - 1 > index;
                _this.prevButton.classList.toggle(classNames.inactive, !canPrev);
                _this.prevButton.classList.toggle(classNames.active, canPrev);
                _this.nextButton.classList.toggle(classNames.inactive, !canNext);
                _this.nextButton.classList.toggle(classNames.active, canNext);
                _this.prevButton.disabled = !canPrev;
                _this.nextButton.disabled = !canNext;
                _this.pageInfo.innerHTML = (1 + index) + " of " + count;
            });
        }
        PageNavigator.prototype.dispatch = function (name) {
            this.domNode.dispatchEvent(new Event(name));
        };
        PageNavigator.prototype.on = function (name, listener) {
            this.domNode.addEventListener(name, listener);
        };
        PageNavigator.prototype.template = function () {
            return "<button class=\"arrow btn-prev\"></button><span class=\"page-num\">m of n</span><button class=\"arrow btn-next\"></button>";
        };
        PageNavigator.prototype.hide = function () {
            this.domNode.classList.add(classNames.hidden);
            this.dispatch(eventNames.hide);
        };
        PageNavigator.prototype.show = function () {
            this.domNode.classList.remove(classNames.hidden);
            this.dispatch(eventNames.show);
        };
        return PageNavigator;
    }());
    return PageNavigator;
});
define("ol3-popup", ["require", "exports", "jquery", "openlayers", "paging/paging", "paging/page-navigator"], function (require, exports, $, ol, paging_1, PageNavigator) {
    "use strict";
    var css = "\n.ol-popup {\n    position: absolute;\n    bottom: 12px;\n    left: -50px;\n}\n\n.ol-popup:after {\n    top: auto;\n    bottom: -20px;\n    left: 50px;\n    border: solid transparent;\n    border-top-color: inherit;\n    content: \" \";\n    height: 0;\n    width: 0;\n    position: absolute;\n    pointer-events: none;\n    border-width: 10px;\n    margin-left: -10px;\n}\n\n.ol-popup.docked {\n    position:absolute;\n    bottom:0;\n    top:0;\n    left:0;\n    right:0;\n    pointer-events: all;\n}\n\n.ol-popup.docked:after {\n    display:none;\n}\n\n.ol-popup.docked .pages {\n    max-height: inherit;\n    overflow: auto;\n    height: calc(100% - 60px);\n}\n\n.ol-popup.docked .pagination {\n    position: absolute;\n    bottom: 0;\n}\n\n.ol-popup .pagination .btn-prev::after {\n    content: \"\u21E6\"; \n}\n\n.ol-popup .pagination .btn-next::after {\n    content: \"\u21E8\"; \n}\n\n.ol-popup .ol-popup-closer {\n    border: none;\n    background: transparent;\n    color: inherit;\n    position: absolute;\n    top: 0;\n    right: 0;\n    text-decoration: none;\n}\n    \n.ol-popup .ol-popup-closer:after {\n    content:'\u2716';\n}\n\n.ol-popup .ol-popup-docker {\n    border: none;\n    background: transparent;\n    color: inherit;\n    text-decoration: none;\n    position: absolute;\n    top: 0;\n    right: 20px;\n}\n\n.ol-popup .ol-popup-docker:after {\n    content:'\u25A1';\n}\n";
    var classNames = {
        olPopup: 'ol-popup',
        olPopupDocker: 'ol-popup-docker',
        olPopupCloser: 'ol-popup-closer',
        olPopupContent: 'ol-popup-content',
        hidden: 'hidden',
        docked: 'docked'
    };
    var eventNames = {
        show: "show",
        hide: "hide",
        next: "next-page"
    };
    /**
     * extends the base object without replacing defined attributes
     */
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    /**
     * debounce: wait until it hasn't been called for a while before executing the callback
     */
    function debounce(func, wait, immediate) {
        var _this = this;
        if (wait === void 0) { wait = 20; }
        if (immediate === void 0) { immediate = false; }
        var timeout;
        return (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.call(_this, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.call(_this, args);
        });
    }
    var isTouchDevice = function () {
        try {
            document.createEvent("TouchEvent");
            isTouchDevice = function () { return true; };
        }
        catch (e) {
            isTouchDevice = function () { return false; };
        }
        return isTouchDevice();
    };
    /**
     * Apply workaround to enable scrolling of overflowing content within an
     * element. Adapted from https://gist.github.com/chrismbarr/4107472
     */
    function enableTouchScroll(elm) {
        var scrollStartPos = 0;
        elm.addEventListener("touchstart", function (event) {
            scrollStartPos = this.scrollTop + event.touches[0].pageY;
        }, false);
        elm.addEventListener("touchmove", function (event) {
            this.scrollTop = scrollStartPos - event.touches[0].pageY;
        }, false);
    }
    ;
    /**
     * Default options for the popup control so it can be created without any contructor arguments
     */
    var DEFAULT_OPTIONS = {
        // determines if this should be the first (or last) element in its container
        insertFirst: true,
        autoPan: true,
        autoPanAnimation: {
            source: null,
            duration: 250
        },
        pointerPosition: 50,
        positioning: "top-right",
        stopEvent: true
    };
    /**
     * The control formerly known as ol.Overlay.Popup
     */
    var Popup = (function (_super) {
        __extends(Popup, _super);
        function Popup(options) {
            if (options === void 0) { options = DEFAULT_OPTIONS; }
            options = defaults({}, options, DEFAULT_OPTIONS);
            /**
             * overlays have a map, element, offset, position, positioning
             */
            _super.call(this, options);
            this.options = options;
            this.handlers = [];
            // the internal properties, dom and listeners are in place, time to create the popup
            this.postCreate();
        }
        Popup.prototype.postCreate = function () {
            var _this = this;
            this.injectCss(css);
            var options = this.options;
            var domNode = this.domNode = document.createElement('div');
            domNode.className = classNames.olPopup;
            this.setElement(domNode);
            if (this.options.pointerPosition) {
                this.setIndicatorPosition(this.options.pointerPosition);
            }
            if (this.options.dockContainer) {
                var dockContainer = $(this.options.dockContainer)[0];
                if (dockContainer) {
                    var docker = this.docker = document.createElement('button');
                    docker.className = classNames.olPopupDocker;
                    domNode.appendChild(docker);
                    docker.addEventListener('click', function (evt) {
                        _this.isDocked() ? _this.undock() : _this.dock();
                        evt.preventDefault();
                    }, false);
                }
            }
            {
                var closer = this.closer = document.createElement('button');
                closer.className = classNames.olPopupCloser;
                domNode.appendChild(closer);
                closer.addEventListener('click', function (evt) {
                    _this.hide();
                    evt.preventDefault();
                }, false);
            }
            {
                var content = this.content = document.createElement('div');
                content.className = classNames.olPopupContent;
                this.domNode.appendChild(content);
                // Apply workaround to enable scrolling of content div on touch devices
                isTouchDevice() && enableTouchScroll(content);
            }
            {
                var pages_1 = this.pages = new paging_1.Paging({ popup: this });
                var pageNavigator = new PageNavigator({ pages: pages_1 });
                pageNavigator.hide();
                pageNavigator.on("prev", function () { return pages_1.prev(); });
                pageNavigator.on("next", function () { return pages_1.next(); });
                pages_1.on("goto", function () { return _this.panIntoView(); });
            }
            if (0) {
                var callback_1 = this.setPosition;
                this.setPosition = debounce(function (args) { return callback_1.apply(_this, args); }, 50);
            }
        };
        Popup.prototype.injectCss = function (css) {
            var style = $("<style type='text/css'>" + css + "</style>");
            style.appendTo('head');
            this.handlers.push(function () { return style.remove(); });
        };
        Popup.prototype.setIndicatorPosition = function (x) {
            var css = "\n.ol-popup { position: absolute; bottom: 12px; left: -" + x + "px; }\n.ol-popup:after { bottom: -20px; left: " + x + "px; }\n";
            this.injectCss(css);
        };
        Popup.prototype.setPosition = function (position) {
            this.options.position = position;
            if (!this.isDocked()) {
                _super.prototype.setPosition.call(this, position);
            }
            else {
                var view = this.options.map.getView();
                view.animate({
                    center: position
                });
            }
        };
        Popup.prototype.panIntoView = function () {
            if (!this.isOpened())
                return;
            if (this.isDocked())
                return;
            var p = this.getPosition();
            p && this.setPosition(p.map(function (v) { return v; })); // clone p to force change
        };
        Popup.prototype.destroy = function () {
            this.handlers.forEach(function (h) { return h(); });
            this.handlers = [];
            this.getMap().removeOverlay(this);
            this.dispose();
            this.dispatch("dispose");
        };
        Popup.prototype.dispatch = function (name) {
            this["dispatchEvent"](new Event(name));
        };
        Popup.prototype.show = function (coord, html) {
            if (html instanceof HTMLElement) {
                this.content.innerHTML = "";
                this.content.appendChild(html);
            }
            else {
                this.content.innerHTML = html;
            }
            this.domNode.classList.remove(classNames.hidden);
            this.setPosition(coord);
            this.dispatch(eventNames.show);
            return this;
        };
        Popup.prototype.hide = function () {
            !this.isDocked() && this.setPosition(undefined);
            this.pages.clear();
            this.dispatch(eventNames.hide);
            this.domNode.classList.add(classNames.hidden);
            return this;
        };
        Popup.prototype.isOpened = function () {
            return !this.domNode.classList.contains(classNames.hidden);
        };
        Popup.prototype.isDocked = function () {
            return this.domNode.classList.contains(classNames.docked);
        };
        Popup.prototype.dock = function () {
            var map = this.getMap();
            this.options.map = map;
            this.options.parentNode = this.domNode.parentElement;
            map.removeOverlay(this);
            this.domNode.classList.add(classNames.docked);
            $(this.options.dockContainer).append(this.domNode);
        };
        Popup.prototype.undock = function () {
            this.options.parentNode.appendChild(this.domNode);
            this.domNode.classList.remove(classNames.docked);
            this.options.map.addOverlay(this);
            this.setPosition(this.options.position);
        };
        return Popup;
    }(ol.Overlay));
    exports.Popup = Popup;
});
define("extras/feature-creator", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    /**
     * Used for testing, will create features when Alt+Clicking the map
     */
    var FeatureCreator = (function () {
        function FeatureCreator(options) {
            this.options = options;
            var map = options.map;
            var vectorSource = new ol.source.Vector({
                features: []
            });
            var vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                })
            });
            map.addLayer(vectorLayer);
            map.on("click", function (event) {
                if (!ol.events.condition.altKeyOnly(event))
                    return;
                event = event["mapBrowserEvent"] || event;
                var coord = event.coordinate;
                var geom = new ol.geom.Point(coord);
                var feature = new ol.Feature({
                    geometry: geom,
                    name: "New Feature",
                    attributes: {}
                });
                vectorSource.addFeature(feature);
            });
        }
        return FeatureCreator;
    }());
    return FeatureCreator;
});
define("extras/feature-selector", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Interaction which opens the popup when zero or more features are clicked
     */
    var FeatureSelector = (function () {
        function FeatureSelector(options) {
            var _this = this;
            this.options = options;
            var map = options.map;
            map.on("click", function (event) {
                console.log("click");
                var popup = options.popup;
                var coord = event.coordinate;
                popup.hide();
                popup.show(coord, "<label>" + _this.options.title + "</label>");
                var pageNum = 1;
                map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
                    var page = document.createElement('p');
                    page.innerHTML = "Page " + pageNum++ + " " + feature.getGeometryName();
                    popup.pages.add(page, feature.getGeometry());
                });
                popup.pages.goto(0);
            });
        }
        return FeatureSelector;
    }());
    return FeatureSelector;
});
define("examples/paging", ["require", "exports", "openlayers", "ol3-popup", "extras/feature-creator", "extras/feature-selector", "jquery"], function (require, exports, ol, Popup, FeatureCreator, FeatureSelector, $) {
    "use strict";
    var css = "\nhead, body {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.map {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n.dock-container {\n    position: absolute;\n    top: 20px;\n    right: 20px;\n    width: 200px;\n    height: 300px;\n    border: 1px solid rgba(0,0,0,0.1);\n    display: inline-block;\n    padding: 20px;\n    background: transparent;\n    pointer-events: none;\n}\n\n.ol-popup {\n    min-width: 200px;\n    min-height: 50px;\n    background: gold;\n    color: green;\n}\n\n.ol-popup:after {\n    border-top-color: gold;\n}\n\n.ol-popup .ol-popup-content {\n    padding: 0;\n}\n\n.ol-popup .ol-popup-content > *:first-child {\n    margin-right: 36px;\n    overflow: hidden;\n    border-bottom: 1px solid black;\n    display: block;\n}\n\n";
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
            pointerPosition: 100,
            dockContainer: dockContainer
        });
        $("<style type='text/css'>" + css + "</style>").appendTo('head');
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
//# sourceMappingURL=run.js.map