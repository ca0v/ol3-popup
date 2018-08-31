var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("ol3-popup/paging/paging", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getInteriorPoint(geom) {
        if (geom["getInteriorPoint"])
            return geom["getInteriorPoint"]().getCoordinates();
        return ol.extent.getCenter(geom.getExtent());
    }
    var classNames = {
        pages: "pages",
        page: "page"
    };
    var eventNames = {
        add: "add",
        clear: "clear",
        goto: "goto",
        remove: "remove"
    };
    ;
    function getId() {
        return "_" + Math.random() * 1000000;
    }
    var Paging = (function (_super) {
        __extends(Paging, _super);
        function Paging(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this._pages = [];
            _this.domNode = document.createElement("div");
            _this.domNode.classList.add(classNames.pages);
            options.popup.domNode.appendChild(_this.domNode);
            return _this;
        }
        Object.defineProperty(Paging.prototype, "activePage", {
            get: function () {
                return this._activePage;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paging.prototype, "activeIndex", {
            get: function () {
                return this._pages.indexOf(this._activePage);
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
        Paging.prototype.on = function (name, listener) {
            _super.prototype.on.call(this, name, listener);
        };
        Paging.prototype.findPage = function (feature) {
            return this._pages.filter(function (p) { return p.feature === feature; })[0];
        };
        Paging.prototype.removePage = function (page) {
            var index = this._pages.indexOf(page);
            if (0 <= index) {
                this._pages.splice(index, 1);
                var count = this._pages.length;
                if (index >= count)
                    index == count - 1;
                this.goto(index);
            }
        };
        Paging.prototype.addFeature = function (feature, options) {
            var page = this.findPage(feature);
            if (page) {
                this.goto(this._pages.indexOf(page));
                return page;
            }
            var geom = feature.getGeometry();
            if (geom.intersectsCoordinate(options.searchCoordinate)) {
                geom = new ol.geom.Point(options.searchCoordinate);
            }
            else {
                geom = new ol.geom.Point(geom.getClosestPoint(options.searchCoordinate));
            }
            page = {
                element: document.createElement("div"),
                feature: feature,
                location: geom,
                uid: getId()
            };
            this._pages.push(page);
            this.dispatchEvent({
                type: eventNames.add,
                element: page.element,
                feature: page.feature,
                geom: page.location,
                pageIndex: page.uid,
            });
            return page;
        };
        Paging.prototype.add = function (source, geom) {
            var page;
            var pageDiv = document.createElement("div");
            if (false) {
            }
            else if (typeof source === "string") {
                pageDiv.innerHTML = source;
                this._pages.push(page = {
                    element: pageDiv,
                    location: geom,
                    uid: getId(),
                });
            }
            else if (source["appendChild"]) {
                pageDiv.classList.add(classNames.page);
                this._pages.push(page = {
                    element: pageDiv,
                    location: geom,
                    uid: getId(),
                });
            }
            else if (source["then"]) {
                var d = source;
                pageDiv.classList.add(classNames.page);
                this._pages.push(page = {
                    element: pageDiv,
                    location: geom,
                    uid: getId(),
                });
                $.when(d).then(function (v) {
                    if (typeof v === "string") {
                        pageDiv.innerHTML = v;
                    }
                    else {
                        pageDiv.appendChild(v);
                    }
                });
            }
            else if (typeof source === "function") {
                pageDiv.classList.add("page");
                this._pages.push(page = {
                    callback: source,
                    element: pageDiv,
                    location: geom,
                    uid: getId(),
                });
            }
            else {
                throw "invalid source value: " + source;
            }
            this.dispatchEvent({
                type: eventNames.add,
                element: pageDiv,
                feature: null,
                geom: geom,
                pageIndex: this._pages.length - 1
            });
            return page;
        };
        Paging.prototype.clear = function () {
            this._activePage = null;
            this._pages = [];
            this.dispatchEvent(eventNames.clear);
        };
        Paging.prototype.goto = function (index) {
            var _this = this;
            var page;
            if (typeof index === "number") {
                page = this._pages[index];
            }
            else {
                page = this._pages.filter(function (p) { return p.uid === index; })[0];
            }
            if (!page)
                return;
            var popup = this.options.popup;
            if (page.feature) {
                this.options.popup.show(getInteriorPoint(page.location || page.feature.getGeometry()), popup.options.asContent(page.feature));
                this._activePage = page;
                this.dispatchEvent(eventNames.goto);
                return;
            }
            var d = $.Deferred();
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
                    d.resolve();
                });
            }
            else {
                d.resolve();
            }
            d.then(function () {
                _this._activePage = page;
                _this.options.popup.show(getInteriorPoint(page.location), page.element);
                _this.dispatchEvent(eventNames.goto);
            });
        };
        Paging.prototype.next = function () {
            (0 <= this.activeIndex) && (this.activeIndex < this.count) && this.goto(this.activeIndex + 1);
        };
        Paging.prototype.prev = function () {
            (0 < this.activeIndex) && this.goto(this.activeIndex - 1);
        };
        Paging.prototype.indexOf = function (feature) {
            var result = -1;
            this._pages.some(function (f, i) {
                if (f.feature === feature) {
                    result = i;
                    return true;
                }
            });
            return result;
        };
        return Paging;
    }(ol.Observable));
    exports.Paging = Paging;
});
define("ol3-popup/paging/page-navigator", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    function toggle(e, className, toggle) {
        if (toggle === void 0) { toggle = false; }
        !toggle ? e.classList.remove(className) : e.classList.add(className);
    }
    var PageNavigator = (function (_super) {
        __extends(PageNavigator, _super);
        function PageNavigator(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            var pages = options.pages;
            _this.domNode = document.createElement("div");
            _this.domNode.classList.add("pagination");
            _this.domNode.innerHTML = _this.template();
            _this.prevButton = _this.domNode.getElementsByClassName(classNames.prev)[0];
            _this.nextButton = _this.domNode.getElementsByClassName(classNames.next)[0];
            _this.pageInfo = _this.domNode.getElementsByClassName(classNames.pagenum)[0];
            pages.options.popup.domNode.appendChild(_this.domNode);
            _this.prevButton.addEventListener('click', function () { return _this.dispatchEvent(eventNames.prev); });
            _this.nextButton.addEventListener('click', function () { return _this.dispatchEvent(eventNames.next); });
            pages.on("goto", function () { return pages.count > 1 ? _this.show() : _this.hide(); });
            pages.on("clear", function () { return _this.hide(); });
            pages.on("goto", function () {
                var index = pages.activeIndex;
                var count = pages.count;
                var canPrev = 0 < index;
                var canNext = count - 1 > index;
                toggle(_this.prevButton, classNames.inactive, !canPrev);
                toggle(_this.prevButton, classNames.active, canPrev);
                toggle(_this.nextButton, classNames.inactive, !canNext);
                toggle(_this.nextButton, classNames.active, canNext);
                _this.prevButton.disabled = !canPrev;
                _this.nextButton.disabled = !canNext;
                _this.pageInfo.innerHTML = 1 + index + " of " + count;
            });
            return _this;
        }
        PageNavigator.prototype.template = function () {
            return "<button class=\"arrow btn-prev\"></button><span class=\"page-num\">m of n</span><button class=\"arrow btn-next\"></button>";
        };
        PageNavigator.prototype.hide = function () {
            this.domNode.classList.add(classNames.hidden);
            this.dispatchEvent(eventNames.hide);
        };
        PageNavigator.prototype.show = function () {
            this.domNode.classList.remove(classNames.hidden);
            this.dispatchEvent(eventNames.show);
        };
        return PageNavigator;
    }(ol.Observable));
    exports.default = PageNavigator;
});
define("node_modules/ol3-fun/ol3-fun/common", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    exports.uuid = uuid;
    function asArray(list) {
        var result = new Array(list.length);
        for (var i = 0; i < list.length; i++) {
            result[i] = list[i];
        }
        return result;
    }
    exports.asArray = asArray;
    function toggle(e, className, toggle) {
        if (toggle === void 0) { toggle = false; }
        !toggle ? e.classList.remove(className) : e.classList.add(className);
    }
    exports.toggle = toggle;
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(function (v) { return parse(v, type[0]); }));
        }
        throw "unknown type: " + type;
    }
    exports.parse = parse;
    function getQueryParameters(options, url) {
        if (url === void 0) { url = window.location.href; }
        var opts = options;
        Object.keys(opts).forEach(function (k) {
            doif(getParameterByName(k, url), function (v) {
                var value = parse(v, opts[k]);
                if (value !== undefined)
                    opts[k] = value;
            });
        });
    }
    exports.getQueryParameters = getQueryParameters;
    function getParameterByName(name, url) {
        if (url === void 0) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    exports.getParameterByName = getParameterByName;
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    exports.doif = doif;
    function mixin(a, b) {
        Object.keys(b).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    exports.mixin = mixin;
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
    exports.defaults = defaults;
    function cssin(name, css) {
        var id = "style-" + name;
        var styleTag = document.getElementById(id);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = id;
            styleTag.type = "text/css";
            document.head.appendChild(styleTag);
            styleTag.appendChild(document.createTextNode(css));
        }
        var dataset = styleTag.dataset;
        dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";
        return function () {
            dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
            if (dataset["count"] === "0") {
                styleTag.remove();
            }
        };
    }
    exports.cssin = cssin;
    function debounce(func, wait, immediate) {
        var _this = this;
        if (wait === void 0) { wait = 50; }
        if (immediate === void 0) { immediate = false; }
        var timeout;
        return (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.apply(_this, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.call(_this, args);
        });
    }
    exports.debounce = debounce;
    function html(html) {
        var a = document.createElement("div");
        a.innerHTML = html;
        return (a.firstElementChild || a.firstChild);
    }
    exports.html = html;
    function pair(a1, a2) {
        var result = new Array(a1.length * a2.length);
        var i = 0;
        a1.forEach(function (v1) { return a2.forEach(function (v2) { return result[i++] = [v1, v2]; }); });
        return result;
    }
    exports.pair = pair;
    function range(n) {
        var result = new Array(n);
        for (var i = 0; i < n; i++)
            result[i] = i;
        return result;
    }
    exports.range = range;
    function shuffle(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    exports.shuffle = shuffle;
});
define("ol3-popup/interaction", ["require", "exports", "openlayers", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, ol, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dispose = function (handlers) {
        return handlers.forEach(function (h) { return (h instanceof Function) ? h() : ol.Observable.unByKey(h); });
    };
    var SelectInteraction = (function (_super) {
        __extends(SelectInteraction, _super);
        function SelectInteraction(options) {
            var _this = _super.call(this, options) || this;
            _this.options = options;
            var popup = options.popup;
            var map = options.map;
            var overlay;
            _this.handlers = [];
            _this.handlers.push(map.on("click", function (args) {
                var _a, _b, _c;
                if (!_this.get("active"))
                    return;
                var wasDocked = popup.isDocked();
                if (!popup.options.multi || !options.addCondition(args)) {
                    popup.pages.clear();
                }
                {
                    var found_1 = false;
                    var extent_1 = ol.extent.createEmpty();
                    extent_1[0] = extent_1[2] = args.pixel[0];
                    extent_1[1] = extent_1[3] = args.pixel[1];
                    extent_1 = ol.extent.buffer(extent_1, 4);
                    _a = [
                        map.getCoordinateFromPixel([extent_1[0], extent_1[1]]),
                        map.getCoordinateFromPixel([extent_1[2], extent_1[3]])
                    ], _b = _a[0], extent_1[0] = _b[0], extent_1[3] = _b[1], _c = _a[1], extent_1[2] = _c[0], extent_1[1] = _c[1];
                    var layers_1 = popup.options.layers;
                    if (!layers_1) {
                        layers_1 = map.getLayers().getArray().filter(function (l) { return l instanceof ol.layer.Vector; });
                    }
                    var page_1;
                    layers_1.forEach(function (layer) {
                        if (layer === overlay)
                            return;
                        layer.getSource().forEachFeatureIntersectingExtent(extent_1, function (feature) {
                            page_1 = popup.pages.addFeature(feature, {
                                searchCoordinate: args.coordinate
                            });
                            found_1 = true;
                            return !popup.options.multi;
                        });
                    });
                    if (!found_1) {
                        map.forEachFeatureAtPixel(args.pixel, function (feature, layer) {
                            if (!layer || layer === overlay || -1 === layers_1.indexOf(layer)) {
                                return;
                            }
                            page_1 = popup.pages.addFeature(feature, {
                                searchCoordinate: args.coordinate
                            });
                            found_1 = true;
                            return !popup.options.multi;
                        });
                    }
                    if (!found_1 && popup.options.showCoordinates) {
                        page_1 = popup.pages.add(("\n<table>\n<tr><td>lon</td><td>" + args.coordinate[0].toPrecision(6) + "</td></tr>\n<tr><td>lat</td><td>" + args.coordinate[1].toPrecision(6) + "</td></tr>\n</table>")
                            .trim(), new ol.geom.Point(args.coordinate));
                        found_1 = true;
                    }
                    if (found_1) {
                        popup.pages.goto(page_1.uid);
                        if (wasDocked && !popup.isDocked())
                            popup.dock();
                    }
                    else {
                        if (!popup.options.multi || !options.addCondition(args)) {
                            popup.hide();
                        }
                    }
                }
            }));
            if (popup.options.pagingStyle) {
                overlay = _this.setupOverlay();
            }
            popup.on("dispose", function () { return _this.destroy(); });
            return _this;
        }
        SelectInteraction.create = function (options) {
            if (!options.popup)
                throw "popup is a required option";
            if (!options.map) {
                options.map = options.popup.options.map;
                if (!options.map)
                    "map is a require option";
            }
            options = common_1.defaults(options, SelectInteraction.DEFAULT_OPTIONS);
            options.addCondition = options.addCondition || ol.events.condition.shiftKeyOnly;
            options.removeCondition = options.removeCondition || ol.events.condition.never;
            options.toggleCondition = options.addCondition || ol.events.condition.shiftKeyOnly;
            return new SelectInteraction(options);
        };
        SelectInteraction.prototype.setupOverlay = function () {
            var _this = this;
            var options = this.options;
            var popup = options.popup;
            var source = new ol.source.Vector({
                useSpatialIndex: false,
                wrapX: this.options.wrapX
            });
            var featureOverlay = new ol.layer.Vector({
                map: this.options.map,
                source: source,
                updateWhileAnimating: true,
                updateWhileInteracting: true
            });
            featureOverlay.setStyle(function (feature, resolution) {
                var pageIndex = source.getFeatures().indexOf(feature);
                return popup.options.pagingStyle(feature, resolution, pageIndex);
            });
            featureOverlay.setMap(this.options.map);
            this.handlers.push(function () { return _this.options.map.removeLayer(featureOverlay); });
            popup.pages.on("clear", function () {
                source.clear();
            });
            this.handlers.push(popup.pages.on("goto", function () { return featureOverlay.getSource().refresh(); }));
            popup.pages.on("remove", function (args) {
                source.forEachFeature(function (f) {
                    if (f.get("page-index") === args.pageIndex) {
                        source.removeFeature(f);
                        return true;
                    }
                });
            });
            popup.pages.on("add", function (args) {
                var feature = args.feature;
                if (feature) {
                    feature = feature.clone();
                    feature.setStyle(null);
                    if (args.geom) {
                        feature.setGeometry(args.geom);
                    }
                }
                else {
                    if (args.geom) {
                        feature = new ol.Feature();
                        feature.setGeometry(args.geom);
                    }
                }
                if (feature) {
                    feature.set("page-index", args.pageIndex);
                    source.addFeature(feature);
                }
            });
            return featureOverlay;
        };
        SelectInteraction.prototype.destroy = function () {
            dispose(this.handlers);
        };
        SelectInteraction.DEFAULT_OPTIONS = {
            multi: true
        };
        return SelectInteraction;
    }(ol.interaction.Select));
    exports.SelectInteraction = SelectInteraction;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/common/mixin", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function mixin(a, b) {
        Object.keys(b).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    exports.mixin = mixin;
});
define("node_modules/ol3-symbolizer/index", ["require", "exports", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, Symbolizer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Symbolizer = Symbolizer;
});
define("ol3-popup/commands/smartpick", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function smartpick(popup, targetPosition, threshold) {
        if (!targetPosition) {
            targetPosition = popup.getPosition();
        }
        var padding = [0, 0];
        if (typeof threshold !== "number") {
            threshold = (popup.options.autoPanMargin || 0) + (popup.options.pointerPosition || 0);
            var content = popup.content;
            var style = getComputedStyle(content);
            var _a = [style.width, style.height].map(function (n) { return parseInt(n); }), w = _a[0], h = _a[1];
            padding = [threshold + w / 2, threshold + h / 2];
        }
        else {
            padding = [threshold, threshold];
        }
        var _b = popup.getPositioning().split("-", 2), verticalPosition = _b[0], horizontalPosition = _b[1];
        var _c = popup.options.map.getPixelFromCoordinate(targetPosition), x = _c[0], y = _c[1];
        var _d = popup.options.map.getSize(), width = _d[0], height = _d[1];
        var distanceToLeft = x;
        var distanceToTop = y;
        var distanceToRight = width - x;
        var distanceToBottom = height - y;
        if (distanceToTop < padding[1])
            verticalPosition = "top";
        else if (distanceToBottom < padding[1])
            verticalPosition = "bottom";
        else
            verticalPosition = null;
        if (distanceToLeft < padding[0])
            horizontalPosition = "left";
        else if (distanceToRight < padding[0])
            horizontalPosition = "right";
        else
            horizontalPosition = "center";
        if (!verticalPosition && horizontalPosition !== "center") {
            verticalPosition = "center";
        }
        horizontalPosition = horizontalPosition || "center";
        verticalPosition = verticalPosition || ((distanceToTop < distanceToBottom) ? "top" : "bottom");
        return verticalPosition + "-" + horizontalPosition;
    }
    exports.smartpick = smartpick;
    ;
});
define("ol3-popup/ol3-popup", ["require", "exports", "jquery", "openlayers", "ol3-popup/paging/paging", "ol3-popup/paging/page-navigator", "node_modules/ol3-fun/ol3-fun/common", "ol3-popup/interaction", "node_modules/ol3-symbolizer/index", "ol3-popup/commands/smartpick", "node_modules/ol3-symbolizer/ol3-symbolizer/common/mixin"], function (require, exports, $, ol, paging_1, page_navigator_1, common_2, interaction_1, Symbolizer, smartpick_1, mixin_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var symbolizer = new Symbolizer.Symbolizer.StyleConverter();
    var css = "\n.ol-popup {\n}\n\n.ol-popup.hidden {\n    display: none;\n}\n\n.ol-popup-element.docked {\n    position:absolute;\n    bottom:0;\n    top:0;\n    left:0;\n    right:0;\n    width:auto;\n    height:auto;\n    pointer-events: all;\n}\n\n.ol-popup-element.docked:after {\n    display:none;\n}\n\n.ol-popup-element.docked .pages {\n    max-height: inherit;\n    overflow: auto;\n    height: calc(100% - 60px);\n}\n\n.ol-popup-element.docked .pagination {\n    position: absolute;\n    bottom: 0;\n}\n\n.ol-popup .pagination .btn-prev::after {\n    content: \"\u21E6\"; \n}\n\n.ol-popup .pagination .btn-next::after {\n    content: \"\u21E8\"; \n}\n\n.ol-popup .pagination.hidden {\n    display: none;\n}\n\n.ol-popup-element .pagination .btn-prev::after {\n    content: \"\u21E6\"; \n}\n\n.ol-popup-element .pagination .btn-next::after {\n    content: \"\u21E8\"; \n}\n\n.ol-popup-element .pagination.hidden {\n    display: none;\n}\n\n.ol-popup-element .ol-popup-closer {\n    border: none;\n    background: transparent;\n    color: inherit;\n    position: absolute;\n    top: 0;\n    right: 0;\n    text-decoration: none;\n}\n    \n.ol-popup-element .ol-popup-closer:after {\n    content:'\u2716';\n}\n\n.ol-popup .ol-popup-docker {\n    border: none;\n    background: transparent;\n    color: inherit;\n    text-decoration: none;\n    position: absolute;\n    top: 0;\n    right: 20px;\n}\n\n.ol-popup .ol-popup-docker:after {\n    content:'\u25A1';\n}\n\n.simple-popup {\n    border: 1px solid black;\n    border-radius: 4px;\n    padding: 10px;\n    background-color: rgba(80, 80, 80, 0.5);\n    color: rgb(250, 250, 250);\n    max-width: 120px;\n}\n\n.simple-popup-down-arrow {\n    color: black;\n    font-size: 20px;\n}\n\n.simple-popup-down-arrow:after {\n    content: \"\u21E9\";\n}\n\n.simple-popup-up-arrow {\n    color: black;\n    font-size: 20px;\n}\n\n.simple-popup-up-arrow:after {\n    content: \"\u21E7\";\n}\n\n.simple-popup-left-arrow {\n    color: black;\n    font-size: 20px;\n}\n\n.simple-popup-left-arrow:after {\n    content: \"\u21E6\";\n}\n\n.simple-popup-right-arrow {\n    color: black;\n    font-size: 20px;\n}\n\n.simple-popup-right-arrow:after {\n    content: \"\u21E8\";\n}\n";
    var baseStyle = symbolizer.fromJson({
        "circle": {
            "fill": {
                "color": "rgba(255,0,0,1)"
            },
            "opacity": 1,
            "stroke": {
                "color": "rgba(255,255,255,1)",
                "width": 1
            },
            "radius": 3
        }
    });
    var classNames = {
        olPopup: 'ol-popup',
        olPopupDocker: 'ol-popup-docker',
        olPopupCloser: 'ol-popup-closer',
        olPopupContent: 'ol-popup-content',
        olPopupElement: 'ol-popup-element',
        hidden: 'hidden',
        docked: 'docked'
    };
    var eventNames = {
        dispose: "dispose",
        dock: "dock",
        hide: "hide",
        show: "show",
        undock: "undock"
    };
    function arrayEqual(a, b) {
        if (!a || !b)
            return false;
        if (a === b)
            return true;
        if (a.length !== b.length)
            return false;
        return a.every(function (v, i) { return v == b[i]; });
    }
    function asContent(feature) {
        var div = document.createElement("div");
        var keys = Object.keys(feature.getProperties()).filter(function (key) {
            var v = feature.get(key);
            if (typeof v === "string")
                return true;
            if (typeof v === "number")
                return true;
            return false;
        });
        div.title = feature.getGeometryName();
        div.innerHTML = "<table>" + keys.map(function (k) { return "<tr><td>" + k + "</td><td>" + feature.get(k) + "</td></tr>"; }).join("") + "</table>";
        return div;
    }
    function pagingStyleFactory(popup) {
        return function (feature, resolution, pageIndex) {
            var style = [baseStyle];
            if (popup.options.multi && popup.pages.count > 1) {
                var isActive = popup.pages.activeIndex === pageIndex;
                var textStyle = symbolizer.fromJson({
                    text: {
                        text: "" + (pageIndex + 1),
                        fill: {
                            color: isActive ? "white" : "black",
                        },
                        stroke: {
                            color: isActive ? "black" : "white",
                            width: isActive ? 4 : 2
                        },
                        "offset-y": 20
                    }
                });
                style.push(textStyle);
            }
            return style;
        };
    }
    var DEFAULT_OPTIONS = {
        map: null,
        asContent: asContent,
        multi: false,
        autoPan: true,
        autoPopup: true,
        autoPanMargin: 20,
        autoPositioning: true,
        className: classNames.olPopup,
        css: "\n.ol-popup {\n    background-color: white;\n    border: 1px solid black;\n    padding: 4px;\n    padding-top: 24px;\n}\n.ol-popup .ol-popup-content {\n    overflow: auto;\n    min-width: 120px;\n    max-width: 360px;\n    max-height: 240px;\n}\n.ol-popup .pages {\n    overflow: auto;\n    max-width: 360px;\n    max-height: 240px;\n}\n.ol-popup .ol-popup-closer {\n    right: 4px;\n}\n".trim(),
        insertFirst: true,
        pointerPosition: 50,
        offset: [0, -10],
        positioning: "bottom-center",
        stopEvent: true,
        showCoordinates: false
    };
    var Popup = (function (_super) {
        __extends(Popup, _super);
        function Popup(options) {
            var _this = _super.call(this, options) || this;
            if (!options.pagingStyle) {
                options.pagingStyle = pagingStyleFactory(_this);
            }
            _this.options = options;
            _this.handlers = [];
            _this.configureDom(options);
            _this.configureDockerButton(_this.domNode);
            _this.configureCloserButton(_this.domNode);
            _this.configureContentContainer();
            _this.configurePaging();
            _this.configureAutoPopup();
            return _this;
        }
        Popup.create = function (options) {
            options = common_2.defaults({}, options, DEFAULT_OPTIONS);
            var popup = new Popup(options);
            options.map && options.map.addOverlay(popup);
            return popup;
        };
        Popup.prototype.configureDom = function (options) {
            common_2.cssin("ol3-popup", css);
            options.css && this.injectCss("options", options.css);
            var domNode = this.domNode = document.createElement('div');
            domNode.className = classNames.olPopupElement;
            this.setElement(domNode);
            this.handlers.push(function () { return domNode.remove(); });
        };
        Popup.prototype.configureContentContainer = function () {
            var content = this.content = document.createElement('div');
            content.className = classNames.olPopupContent;
            this.domNode.appendChild(content);
        };
        Popup.prototype.configureDockerButton = function (domNode) {
            var _this = this;
            if (!this.options.dockContainer)
                return;
            var docker = this.docker = document.createElement('label');
            docker.title = "docker";
            docker.className = classNames.olPopupDocker;
            domNode.appendChild(docker);
            docker.addEventListener('click', function (evt) {
                _this.isDocked() ? _this.undock() : _this.dock();
                evt.preventDefault();
            }, false);
        };
        Popup.prototype.configureCloserButton = function (domNode) {
            var _this = this;
            var closer = this.closer = document.createElement('label');
            closer.title = "closer";
            closer.className = classNames.olPopupCloser;
            domNode.appendChild(closer);
            closer.addEventListener('click', function (evt) {
                _this.isDocked() ? _this.undock() : _this.hide();
                evt.preventDefault();
            }, false);
        };
        Popup.prototype.configurePaging = function () {
            var _this = this;
            var pages = this.pages = new paging_1.Paging({ popup: this });
            var pageNavigator = new page_navigator_1.default({ pages: pages });
            pageNavigator.hide();
            pageNavigator.on("prev", function () { return pages.prev(); });
            pageNavigator.on("next", function () { return pages.next(); });
            pages.on("goto", function () { return _this.panIntoView(); });
        };
        Popup.prototype.configureAutoPopup = function () {
            var _this = this;
            if (!this.options.autoPopup)
                return;
            var autoPopup = interaction_1.SelectInteraction.create({
                popup: this
            });
            this.on("change:active", function () {
                autoPopup.set("active", _this.get("active"));
            });
            this.handlers.push(function () { return autoPopup.destroy(); });
        };
        Popup.prototype.injectCss = function (id, css) {
            id = this.getId() + "_" + id;
            var style = document.getElementById(id);
            if (style)
                style.remove();
            style = common_2.html("<style type='text/css' id='" + id + "'>" + css + "</style>");
            $(document.head).append(style);
            this.handlers.push(function () { return style.remove(); });
        };
        Popup.prototype.hideIndicator = function () {
            this.indicator && this.indicator.setPosition(undefined);
        };
        Popup.prototype.showIndicator = function () {
            var indicator = this.indicator;
            if (!indicator) {
                indicator = this.indicator = new ol.Overlay({
                    autoPan: this.options.autoPan,
                    autoPanMargin: this.options.autoPanMargin,
                    autoPanAnimation: this.options.autoPanAnimation,
                    element: common_2.html("<span class=\"simple-popup-down-arrow\"></span>"),
                });
                this.options.map.addOverlay(indicator);
            }
            indicator.setPositioning(this.getPositioning());
            indicator.setPosition(this.getPosition());
            return indicator;
        };
        Popup.prototype.positionIndicator = function (offset) {
            if (offset === void 0) { offset = this.options.pointerPosition || 0; }
            if (!this.getPosition() && this.indicator) {
                this.hideIndicator();
                return;
            }
            var _a = this.getPositioning().split("-", 2), verticalPosition = _a[0], horizontalPosition = _a[1];
            var indicator = this.showIndicator();
            switch (verticalPosition) {
                case "top":
                    {
                        indicator.setElement(common_2.html("<span class=\"simple-popup-up-arrow\"></span>"));
                        indicator.setOffset([0, 0 + offset]);
                        indicator.setPositioning("top-center");
                        var _b = [7, 8 + offset], dx = _b[0], dy = _b[1];
                        switch (horizontalPosition) {
                            case "center":
                                this.setOffset([0, dy]);
                                break;
                            case "left":
                                this.setOffset([-dx, dy]);
                                break;
                            case "right":
                                this.setOffset([dx, dy]);
                                break;
                            default:
                                throw "unknown value: " + horizontalPosition;
                        }
                    }
                    break;
                case "bottom":
                    {
                        indicator.setElement(common_2.html("<span class=\"simple-popup-down-arrow\"></span>"));
                        indicator.setOffset([0, 0 - offset]);
                        indicator.setPositioning("bottom-center");
                        var _c = [7, -(10 + offset)], dx = _c[0], dy = _c[1];
                        switch (horizontalPosition) {
                            case "center":
                                this.setOffset([0, dy]);
                                break;
                            case "left":
                                this.setOffset([-dx, dy]);
                                break;
                            case "right":
                                this.setOffset([dx, dy]);
                                break;
                            default:
                                throw "unknown value: " + horizontalPosition;
                        }
                    }
                    break;
                case "center":
                    {
                        var _d = [5 + offset, 0], dx = _d[0], dy = _d[1];
                        switch (horizontalPosition) {
                            case "center":
                                indicator.setPosition(null);
                                break;
                            case "left":
                                indicator.setElement(common_2.html("<span class=\"simple-popup-left-arrow\"></span>"));
                                indicator.setOffset([offset, 0]);
                                indicator.setPositioning("center-left");
                                this.setOffset([dx, dy]);
                                break;
                            case "right":
                                indicator.setElement(common_2.html("<span class=\"simple-popup-right-arrow\"></span>"));
                                indicator.setOffset([-offset, 0]);
                                indicator.setPositioning("center-right");
                                this.setOffset([-dx, dy]);
                                break;
                            default:
                                throw "unknown value: " + horizontalPosition;
                        }
                    }
                    break;
                default:
                    throw "unknown value: " + verticalPosition;
            }
        };
        Popup.prototype.setPosition = function (position) {
            this.options.position = position;
            if (!this.isDocked()) {
                if (!arrayEqual(this.getPosition(), position)) {
                    _super.prototype.setPosition.call(this, position);
                }
                this.positionIndicator(this.options.pointerPosition);
            }
            else {
                var animation = {
                    center: position
                };
                var view = this.options.map.getView();
                this.options.autoPanAnimation && mixin_1.mixin(animation, this.options.autoPanAnimation.duration);
                view.animate(animation);
            }
        };
        Popup.prototype.panIntoView = function () {
            if (!this.isOpened())
                return;
            if (this.isDocked())
                return;
            _super.prototype.panIntoView.call(this);
        };
        Popup.prototype.destroy = function () {
            this.handlers.forEach(function (h) { return h(); });
            this.handlers = [];
            this.getMap() && this.getMap().removeOverlay(this);
            this.dispatchEvent(eventNames.dispose);
        };
        Popup.prototype.show = function (coord, html) {
            if (html === void 0) { html = null; }
            if (html === null) {
            }
            else if (html instanceof HTMLElement) {
                this.content.innerHTML = "";
                this.content.appendChild(html);
            }
            else if (typeof html === "string") {
                this.content.innerHTML = html;
            }
            else {
                throw "unexpected html";
            }
            if (this.options.autoPositioning) {
                this.setPositioning(smartpick_1.smartpick(this, coord));
            }
            this.setPosition(coord);
            this.domNode.classList.remove(classNames.hidden);
            this.dispatchEvent(eventNames.show);
            return this;
        };
        Popup.prototype.on = function (type, listener) {
            return _super.prototype.on.call(this, type, listener);
        };
        Popup.prototype.hide = function () {
            this.setPosition(undefined);
            this.indicator && this.indicator.setPosition(undefined);
            this.pages.clear();
            this.domNode.classList.add(classNames.hidden);
            this.dispatchEvent(eventNames.hide);
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
            map.removeOverlay(this.indicator);
            this.domNode.classList.add(classNames.docked);
            this.options.dockContainer.appendChild(this.domNode);
            this.dispatchEvent(eventNames.dock);
            return this;
        };
        Popup.prototype.undock = function () {
            var map = this.options.map;
            this.options.parentNode.appendChild(this.domNode);
            this.domNode.classList.remove(classNames.docked);
            map.addOverlay(this);
            map.addOverlay(this.indicator);
            this.dispatchEvent(eventNames.undock);
            this.show(this.options.position);
            return this;
        };
        Popup.prototype.applyOffset = function (_a) {
            var x = _a[0], y = _a[1];
            switch (this.getPositioning()) {
                case "bottom-left":
                    this.setOffset([x, -y]);
                    break;
                case "bottom-right":
                    this.setOffset([-x, -y]);
                    break;
                case "top-left":
                    this.setOffset([x, y]);
                    break;
                case "top-right":
                    this.setOffset([-x, y]);
                    break;
            }
        };
        return Popup;
    }(ol.Overlay));
    exports.Popup = Popup;
});
define("index", ["require", "exports", "ol3-popup/ol3-popup"], function (require, exports, Popup) {
    "use strict";
    return Popup;
});
//# sourceMappingURL=index.max.js.map