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
define("node_modules/ol3-fun/ol3-fun/common", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
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
    function toggle(e, className, force) {
        var exists = e.classList.contains(className);
        if (exists && force !== true) {
            e.classList.remove(className);
            return false;
        }
        if (!exists && force !== false) {
            e.classList.add(className);
            return true;
        }
        return exists;
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
            return v.split(",").map(function (v) { return parse(v, type[0]); });
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
            return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    exports.getParameterByName = getParameterByName;
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    exports.doif = doif;
    function mixin(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).forEach(function (k) { return (a[k] = b[k]); });
        });
        return a;
    }
    exports.mixin = mixin;
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b)
                .filter(function (k) { return a[k] === undefined; })
                .forEach(function (k) { return (a[k] = b[k]); });
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
                    func.apply({}, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
            if (callNow)
                func.apply({}, args);
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
        a1.forEach(function (v1) { return a2.forEach(function (v2) { return (result[i++] = [v1, v2]); }); });
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
define("node_modules/ol3-fun/ol3-fun/navigation", ["require", "exports", "openlayers", "jquery", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, ol, $, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function zoomToFeature(map, feature, options) {
        var promise = $.Deferred();
        options = common_1.defaults(options || {}, {
            duration: 1000,
            padding: 256,
            minResolution: 2 * map.getView().getMinResolution()
        });
        var view = map.getView();
        var currentExtent = view.calculateExtent(map.getSize());
        var targetExtent = feature.getGeometry().getExtent();
        var doit = function (duration) {
            view.fit(targetExtent, {
                size: map.getSize(),
                padding: [options.padding, options.padding, options.padding, options.padding],
                minResolution: options.minResolution,
                duration: duration,
                callback: function () { return promise.resolve(); }
            });
        };
        if (ol.extent.containsExtent(currentExtent, targetExtent)) {
            doit(options.duration);
        }
        else if (ol.extent.containsExtent(currentExtent, targetExtent)) {
            doit(options.duration);
        }
        else {
            var fullExtent = ol.extent.createEmpty();
            ol.extent.extend(fullExtent, currentExtent);
            ol.extent.extend(fullExtent, targetExtent);
            var dscale = ol.extent.getWidth(fullExtent) / ol.extent.getWidth(currentExtent);
            var duration = 0.5 * options.duration;
            view.fit(fullExtent, {
                size: map.getSize(),
                padding: [options.padding, options.padding, options.padding, options.padding],
                minResolution: options.minResolution,
                duration: duration
            });
            setTimeout(function () { return doit(0.5 * options.duration); }, duration);
        }
        return promise;
    }
    exports.zoomToFeature = zoomToFeature;
});
define("node_modules/ol3-fun/ol3-fun/parse-dms", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function decDegFromMatch(m) {
        var signIndex = {
            "-": -1,
            N: 1,
            S: -1,
            E: 1,
            W: -1
        };
        var latLonIndex = {
            "-": "",
            N: "lat",
            S: "lat",
            E: "lon",
            W: "lon"
        };
        var degrees, minutes, seconds, sign, latLon;
        sign = signIndex[m[2]] || signIndex[m[1]] || signIndex[m[6]] || 1;
        degrees = Number(m[3]);
        minutes = m[4] ? Number(m[4]) : 0;
        seconds = m[5] ? Number(m[5]) : 0;
        latLon = latLonIndex[m[1]] || latLonIndex[m[6]];
        if (!inRange(degrees, 0, 180))
            throw "Degrees out of range";
        if (!inRange(minutes, 0, 60))
            throw "Minutes out of range";
        if (!inRange(seconds, 0, 60))
            throw "Seconds out of range";
        return {
            decDeg: sign * (degrees + minutes / 60 + seconds / 3600),
            latLon: latLon
        };
    }
    function inRange(value, a, b) {
        return value >= a && value <= b;
    }
    function toDegreesMinutesAndSeconds(coordinate) {
        var absolute = Math.abs(coordinate);
        var degrees = Math.floor(absolute);
        var minutesNotTruncated = (absolute - degrees) * 60;
        var minutes = Math.floor(minutesNotTruncated);
        var seconds = Math.floor((minutesNotTruncated - minutes) * 60);
        return degrees + " " + minutes + " " + seconds;
    }
    function fromLonLatToDms(lon, lat) {
        var latitude = toDegreesMinutesAndSeconds(lat);
        var latitudeCardinal = lat >= 0 ? "N" : "S";
        var longitude = toDegreesMinutesAndSeconds(lon);
        var longitudeCardinal = lon >= 0 ? "E" : "W";
        return latitude + " " + latitudeCardinal + " " + longitude + " " + longitudeCardinal;
    }
    function fromDmsToLonLat(dmsString) {
        var _a;
        dmsString = dmsString.trim();
        var dmsRe = /([NSEW])?(-)?(\d+(?:\.\d+)?)[°º:d\s]?\s?(?:(\d+(?:\.\d+)?)['’‘′:]\s?(?:(\d{1,2}(?:\.\d+)?)(?:"|″|’’|'')?)?)?\s?([NSEW])?/i;
        var dmsString2;
        var m1 = dmsString.match(dmsRe);
        if (!m1)
            throw "Could not parse string";
        if (m1[1]) {
            m1[6] = undefined;
            dmsString2 = dmsString.substr(m1[0].length - 1).trim();
        }
        else {
            dmsString2 = dmsString.substr(m1[0].length).trim();
        }
        var decDeg1 = decDegFromMatch(m1);
        var m2 = dmsString2.match(dmsRe);
        var decDeg2 = m2 && decDegFromMatch(m2);
        if (typeof decDeg1.latLon === "undefined") {
            if (!isNaN(decDeg1.decDeg) && decDeg2 && isNaN(decDeg2.decDeg)) {
                return decDeg1.decDeg;
            }
            else if (!isNaN(decDeg1.decDeg) && decDeg2 && !isNaN(decDeg2.decDeg)) {
                decDeg1.latLon = "lat";
                decDeg2.latLon = "lon";
            }
            else {
                throw "Could not parse string";
            }
        }
        if (typeof decDeg2.latLon === "undefined") {
            decDeg2.latLon = decDeg1.latLon === "lat" ? "lon" : "lat";
        }
        return _a = {},
            _a[decDeg1.latLon] = decDeg1.decDeg,
            _a[decDeg2.latLon] = decDeg2.decDeg,
            _a;
    }
    function parse(value) {
        if (typeof value === "string")
            return fromDmsToLonLat(value);
        return fromLonLatToDms(value.lon, value.lat);
    }
    exports.parse = parse;
});
define("node_modules/ol3-fun/ol3-fun/slowloop", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function slowloop(functions, interval, cycles) {
        if (interval === void 0) { interval = 1000; }
        if (cycles === void 0) { cycles = 1; }
        var d = $.Deferred();
        var index = 0;
        var cycle = 0;
        if (!functions || 0 >= cycles) {
            d.resolve();
            return d;
        }
        var h = setInterval(function () {
            if (index === functions.length) {
                index = 0;
                if (++cycle === cycles) {
                    d.resolve();
                    clearInterval(h);
                    return;
                }
            }
            try {
                d.notify({ index: index, cycle: cycle });
                functions[index++]();
            }
            catch (ex) {
                clearInterval(h);
                d.reject(ex);
            }
        }, interval);
        return d;
    }
    exports.slowloop = slowloop;
});
define("node_modules/ol3-fun/index", ["require", "exports", "node_modules/ol3-fun/ol3-fun/common", "node_modules/ol3-fun/ol3-fun/navigation", "node_modules/ol3-fun/ol3-fun/parse-dms", "node_modules/ol3-fun/ol3-fun/slowloop"], function (require, exports, common_2, navigation_1, parse_dms_1, slowloop_1) {
    "use strict";
    var index = {
        asArray: common_2.asArray,
        cssin: common_2.cssin,
        debounce: common_2.debounce,
        defaults: common_2.defaults,
        doif: common_2.doif,
        getParameterByName: common_2.getParameterByName,
        getQueryParameters: common_2.getQueryParameters,
        html: common_2.html,
        mixin: common_2.mixin,
        pair: common_2.pair,
        parse: common_2.parse,
        range: common_2.range,
        shuffle: common_2.shuffle,
        toggle: common_2.toggle,
        uuid: common_2.uuid,
        slowloop: slowloop_1.slowloop,
        dms: {
            parse: parse_dms_1.parse,
        },
        navigation: {
            zoomToFeature: navigation_1.zoomToFeature,
        },
    };
    return index;
});
define("ol3-popup/paging/paging", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getInteriorPoint(geom) {
        if (geom.getInteriorPoint)
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
            return _super.prototype.on.call(this, name, listener);
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
                pageIndex: page.uid
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
                this._pages.push((page = {
                    element: pageDiv,
                    location: geom,
                    uid: getId()
                }));
            }
            else if (typeof source.appendChild === "function") {
                pageDiv.appendChild(source);
                pageDiv.classList.add(classNames.page);
                this._pages.push((page = {
                    element: pageDiv,
                    location: geom,
                    uid: getId()
                }));
            }
            else if (source["then"]) {
                var d = source;
                pageDiv.classList.add(classNames.page);
                this._pages.push((page = {
                    element: pageDiv,
                    location: geom,
                    uid: getId()
                }));
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
                this._pages.push((page = {
                    callback: source,
                    element: pageDiv,
                    location: geom,
                    uid: getId()
                }));
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
            0 <= this.activeIndex && this.activeIndex < this.count && this.goto(this.activeIndex + 1);
        };
        Paging.prototype.prev = function () {
            0 < this.activeIndex && this.goto(this.activeIndex - 1);
        };
        Paging.prototype.indexOf = function (feature) {
            var result = -1;
            this._pages.some(function (f, i) {
                if (f.feature === feature) {
                    result = i;
                    return true;
                }
                return false;
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
define("ol3-popup/interaction", ["require", "exports", "openlayers", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, ol, common_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dispose = function (handlers) {
        return handlers.forEach(function (h) { return (h instanceof Function ? h() : ol.Observable.unByKey(h)); });
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
                if (!popup.options.autoPopup)
                    return;
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
                    extent_1 = ol.extent.buffer(extent_1, _this.options.buffer);
                    _a = [
                        map.getCoordinateFromPixel([extent_1[0], extent_1[1]]),
                        map.getCoordinateFromPixel([extent_1[2], extent_1[3]])
                    ], _b = _a[0], extent_1[0] = _b[0], extent_1[3] = _b[1], _c = _a[1], extent_1[2] = _c[0], extent_1[1] = _c[1];
                    var layers_1 = popup.options.layers;
                    if (!layers_1) {
                        layers_1 = map
                            .getLayers()
                            .getArray()
                            .filter(function (l) { return l instanceof ol.layer.Vector; });
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
                                return null;
                            }
                            page_1 = popup.pages.addFeature(feature, {
                                searchCoordinate: args.coordinate
                            });
                            found_1 = true;
                            return !popup.options.multi;
                        });
                    }
                    if (!found_1 && popup.options.showCoordinates) {
                        page_1 = popup.pages.add(("\n<table>\n<tr><td>lon</td><td>" + args.coordinate[0].toPrecision(6) + "</td></tr>\n<tr><td>lat</td><td>" + args.coordinate[1].toPrecision(6) + "</td></tr>\n</table>").trim(), new ol.geom.Point(args.coordinate));
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
            options = common_3.defaults(options, SelectInteraction.DEFAULT_OPTIONS);
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
                    return false;
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
            multi: true,
            buffer: 8
        };
        return SelectInteraction;
    }(ol.interaction.Select));
    exports.SelectInteraction = SelectInteraction;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/common/assign", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assign(obj, prop, value) {
        if (value === null)
            return;
        if (value === undefined)
            return;
        if (typeof value === "object") {
            if (Object.keys(value).length === 0)
                return;
        }
        if (prop === "image") {
            if (value.hasOwnProperty("radius")) {
                prop = "circle";
            }
            if (value.hasOwnProperty("points")) {
                var points = value["points"];
                if (points < Infinity) {
                    prop = "star";
                }
            }
        }
        obj[prop] = value;
    }
    exports.assign = assign;
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
define("node_modules/ol3-symbolizer/ol3-symbolizer/common/doif", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    exports.doif = doif;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-cross", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shapeshifter = (function () {
        function Shapeshifter() {
        }
        Shapeshifter.is = function (style) {
            if (!style)
                return false;
            if (!!style.cross)
                return true;
            if (!style.star)
                return false;
            if (!style.star.radius)
                return false;
            if (4 !== style.star.points)
                return false;
            if (0 != style.star.radius2)
                return false;
            if (0 != style.star.angle)
                return false;
            return true;
        };
        Shapeshifter.as = function (style) {
            var star = style.star;
            if (!star)
                throw "star expected";
            var result = {
                cross: {
                    size: star.radius * 2,
                    opacity: star.opacity,
                    rotateWithView: star.rotateWithView,
                    rotation: star.rotation,
                    scale: star.scale,
                    snapToPixel: star.snapToPixel,
                    stroke: star.stroke,
                }
            };
            return result;
        };
        Shapeshifter.inverse = function (style) {
            var cross = style.cross;
            if (!cross)
                return style;
            return {
                star: {
                    radius: cross.size / 2,
                    radius2: 0,
                    points: 4,
                    angle: 0,
                    opacity: cross.opacity,
                    rotateWithView: cross.rotateWithView,
                    rotation: cross.rotation,
                    scale: cross.scale,
                    snapToPixel: cross.snapToPixel,
                    stroke: cross.stroke,
                }
            };
        };
        return Shapeshifter;
    }());
    exports.Shapeshifter = Shapeshifter;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-square", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shapeshifter = (function () {
        function Shapeshifter() {
        }
        Shapeshifter.is = function (style) {
            if (!style)
                return false;
            if (!!style.square)
                return true;
            if (!style.star)
                return false;
            if (!style.star.radius)
                return false;
            if (4 !== style.star.points)
                return false;
            if (undefined !== style.star.radius2)
                return false;
            if (0.7853981633974483 != style.star.angle)
                return false;
            return true;
        };
        Shapeshifter.as = function (style) {
            var star = style.star;
            if (!star)
                throw "star expected";
            var result = {
                square: {
                    size: star.radius * 2,
                    fill: star.fill,
                    opacity: star.opacity,
                    rotateWithView: star.rotateWithView,
                    rotation: star.rotation,
                    scale: star.scale,
                    snapToPixel: star.snapToPixel,
                    stroke: star.stroke,
                }
            };
            return result;
        };
        Shapeshifter.inverse = function (style) {
            var square = style.square;
            if (!square)
                return style;
            return {
                star: {
                    radius: square.size / 2,
                    radius2: undefined,
                    points: 4,
                    angle: 0.7853981633974483,
                    fill: square.fill,
                    opacity: square.opacity,
                    rotateWithView: square.rotateWithView,
                    rotation: square.rotation,
                    scale: square.scale,
                    snapToPixel: square.snapToPixel,
                    stroke: square.stroke,
                }
            };
        };
        return Shapeshifter;
    }());
    exports.Shapeshifter = Shapeshifter;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-diamond", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shapeshifter = (function () {
        function Shapeshifter() {
        }
        Shapeshifter.is = function (style) {
            if (!style)
                return false;
            if (!!style.diamond)
                return true;
            if (!style.star)
                return false;
            if (!style.star.radius)
                return false;
            if (4 !== style.star.points)
                return false;
            if (undefined !== style.star.radius2)
                return false;
            if (0 != style.star.angle)
                return false;
            return true;
        };
        Shapeshifter.as = function (style) {
            var star = style.star;
            if (!star)
                throw "star expected";
            var result = {
                diamond: {
                    size: style.star.radius * 2,
                    fill: star.fill,
                    opacity: star.opacity,
                    rotateWithView: star.rotateWithView,
                    rotation: star.rotation,
                    scale: star.scale,
                    snapToPixel: star.snapToPixel,
                    stroke: star.stroke,
                }
            };
            return result;
        };
        Shapeshifter.inverse = function (style) {
            var diamond = style.diamond;
            if (!diamond)
                return style;
            return {
                star: {
                    radius: diamond.size / 2,
                    radius2: undefined,
                    points: 4,
                    angle: 0,
                    fill: diamond.fill,
                    opacity: diamond.opacity,
                    rotateWithView: diamond.rotateWithView,
                    rotation: diamond.rotation,
                    scale: diamond.scale,
                    snapToPixel: diamond.snapToPixel,
                    stroke: diamond.stroke,
                }
            };
        };
        return Shapeshifter;
    }());
    exports.Shapeshifter = Shapeshifter;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-triangle", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shapeshifter = (function () {
        function Shapeshifter() {
        }
        Shapeshifter.is = function (style) {
            if (!style)
                return false;
            if (!!style.triangle)
                return true;
            if (!style.star)
                return false;
            if (!style.star.radius)
                return false;
            if (3 !== style.star.points)
                return false;
            if (undefined != style.star.radius2)
                return false;
            if (0 != style.star.angle)
                return false;
            return true;
        };
        Shapeshifter.as = function (style) {
            var star = style.star;
            if (!star)
                throw "star expected";
            var result = {
                triangle: {
                    size: star.radius * 2,
                    fill: star.fill,
                    opacity: star.opacity,
                    rotateWithView: star.rotateWithView,
                    rotation: star.rotation,
                    scale: star.scale,
                    snapToPixel: star.snapToPixel,
                    stroke: star.stroke,
                }
            };
            return result;
        };
        Shapeshifter.inverse = function (style) {
            var triangle = style.triangle;
            if (!triangle)
                return style;
            return {
                star: {
                    radius: triangle.size / 2,
                    radius2: undefined,
                    points: 3,
                    angle: 0,
                    fill: triangle.fill,
                    opacity: triangle.opacity,
                    rotateWithView: triangle.rotateWithView,
                    rotation: triangle.rotation,
                    scale: triangle.scale,
                    snapToPixel: triangle.snapToPixel,
                    stroke: triangle.stroke,
                }
            };
        };
        return Shapeshifter;
    }());
    exports.Shapeshifter = Shapeshifter;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-x", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shapeshifter = (function () {
        function Shapeshifter() {
        }
        Shapeshifter.is = function (style) {
            if (!style)
                return false;
            if (!!style.x)
                return true;
            if (!style.star)
                return false;
            if (!style.star.radius)
                return false;
            if (4 !== style.star.points)
                return false;
            if (0 != style.star.radius2)
                return false;
            if (0.7853981633974483 != style.star.angle)
                return false;
            return true;
        };
        Shapeshifter.as = function (style) {
            var star = style.star;
            if (!star)
                throw "star expected";
            var result = {
                x: {
                    size: star.radius * 2,
                    opacity: star.opacity,
                    rotateWithView: star.rotateWithView,
                    rotation: star.rotation,
                    scale: star.scale,
                    snapToPixel: star.snapToPixel,
                    stroke: star.stroke,
                }
            };
            return result;
        };
        Shapeshifter.inverse = function (style) {
            var x = style.x;
            if (!x)
                return style;
            return {
                star: {
                    radius: x.size / 2,
                    radius2: 0,
                    points: 4,
                    angle: 0.7853981633974483,
                    opacity: x.opacity,
                    rotateWithView: x.rotateWithView,
                    rotation: x.rotation,
                    scale: x.scale,
                    snapToPixel: x.snapToPixel,
                    stroke: x.stroke,
                }
            };
        };
        return Shapeshifter;
    }());
    exports.Shapeshifter = Shapeshifter;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", ["require", "exports", "openlayers", "node_modules/ol3-symbolizer/ol3-symbolizer/common/assign", "node_modules/ol3-symbolizer/ol3-symbolizer/common/mixin", "node_modules/ol3-symbolizer/ol3-symbolizer/common/doif", "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-cross", "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-square", "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-diamond", "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-triangle", "node_modules/ol3-symbolizer/ol3-symbolizer/format/plugins/as-x"], function (require, exports, ol, assign_1, mixin_1, doif_1, as_cross_1, as_square_1, as_diamond_1, as_triangle_1, as_x_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StyleConverter = (function () {
        function StyleConverter() {
            this.converters = [];
            this.converters.push(as_cross_1.Shapeshifter);
            this.converters.push(as_square_1.Shapeshifter);
            this.converters.push(as_diamond_1.Shapeshifter);
            this.converters.push(as_triangle_1.Shapeshifter);
            this.converters.push(as_x_1.Shapeshifter);
        }
        StyleConverter.prototype.fromJson = function (json) {
            this.converters.some(function (c) { return c.is(json) && c.inverse && !!(json = c.inverse(json)); });
            return this.deserializeStyle(json);
        };
        StyleConverter.prototype.toJson = function (style) {
            var result = this.serializeStyle(style);
            this.converters.some(function (c) { return c.is(result) && c.as && !!(result = c.as(result)); });
            return result;
        };
        StyleConverter.prototype.getGeometry = function (feature) {
            var geom = feature.getGeometry();
            if (geom instanceof ol.geom.Polygon) {
                geom = geom.getInteriorPoint();
            }
            return geom;
        };
        StyleConverter.prototype.serializeStyle = function (style) {
            var s = {};
            if (!style)
                return null;
            if (typeof style === "string")
                throw style;
            if (typeof style === "number")
                throw style;
            if (style.getColor)
                mixin_1.mixin(s, this.serializeColor(style.getColor()));
            if (style.getImage)
                assign_1.assign(s, "image", this.serializeImage(style.getImage()));
            if (style.getFill)
                assign_1.assign(s, "fill", this.serializeFill(style.getFill()));
            if (style.getOpacity)
                assign_1.assign(s, "opacity", style.getOpacity());
            if (style.getStroke)
                assign_1.assign(s, "stroke", this.serializeStroke(style.getStroke()));
            if (style.getText)
                assign_1.assign(s, "text", this.serializeText(style.getText()));
            if (style.getWidth)
                assign_1.assign(s, "width", style.getWidth());
            if (style.getOffsetX)
                assign_1.assign(s, "offset-x", style.getOffsetX());
            if (style.getOffsetY)
                assign_1.assign(s, "offset-y", style.getOffsetY());
            if (style.getWidth)
                assign_1.assign(s, "width", style.getWidth());
            if (style.getFont)
                assign_1.assign(s, "font", style.getFont());
            if (style.getRadius)
                assign_1.assign(s, "radius", style.getRadius());
            if (style.getRadius2)
                assign_1.assign(s, "radius2", style.getRadius2());
            if (style.getPoints)
                assign_1.assign(s, "points", style.getPoints());
            if (style.getAngle)
                assign_1.assign(s, "angle", style.getAngle());
            if (style.getRotation)
                assign_1.assign(s, "rotation", style.getRotation());
            if (style.getOrigin)
                assign_1.assign(s, "origin", style.getOrigin());
            if (style.getScale)
                assign_1.assign(s, "scale", style.getScale());
            if (style.getSize)
                assign_1.assign(s, "size", style.getSize());
            if (style.getAnchor) {
                assign_1.assign(s, "anchor", style.getAnchor());
                "anchorXUnits,anchorYUnits,anchorOrigin".split(",").forEach(function (k) {
                    assign_1.assign(s, k, style[k + "_"]);
                });
            }
            if (style.path) {
                if (style.path)
                    assign_1.assign(s, "path", style.path);
                if (style.getImageSize)
                    assign_1.assign(s, "imgSize", style.getImageSize());
                if (style.stroke)
                    assign_1.assign(s, "stroke", style.stroke);
                if (style.fill)
                    assign_1.assign(s, "fill", style.fill);
                if (style.scale)
                    assign_1.assign(s, "scale", style.scale);
                if (style.imgSize)
                    assign_1.assign(s, "imgSize", style.imgSize);
            }
            if (style.getSrc)
                assign_1.assign(s, "src", style.getSrc());
            return s;
        };
        StyleConverter.prototype.serializeImage = function (style) {
            if (typeof style === "string")
                throw style;
            if (typeof style === "number")
                throw style;
            return this.serializeStyle(style);
        };
        StyleConverter.prototype.serializeStroke = function (style) {
            if (typeof style === "string")
                throw style;
            if (typeof style === "number")
                throw style;
            return this.serializeStyle(style);
        };
        StyleConverter.prototype.serializeText = function (style) {
            return style;
        };
        StyleConverter.prototype.serializeColor = function (color) {
            if (color instanceof Array) {
                return {
                    color: ol.color.asString(color)
                };
            }
            else if (color instanceof CanvasGradient) {
                return {
                    gradient: color
                };
            }
            else if (color instanceof CanvasPattern) {
                return {
                    pattern: color
                };
            }
            else if (typeof color === "string") {
                return {
                    color: color
                };
            }
            throw "unknown color type";
        };
        StyleConverter.prototype.serializeFill = function (fill) {
            return this.serializeStyle(fill);
        };
        StyleConverter.prototype.deserializeStyle = function (json) {
            var _this = this;
            var image;
            var text;
            var fill;
            var stroke;
            if (json.circle)
                image = this.deserializeCircle(json.circle);
            else if (json.star)
                image = this.deserializeStar(json.star);
            else if (json.icon)
                image = this.deserializeIcon(json.icon);
            else if (json.svg)
                image = this.deserializeSvg(json.svg);
            else if (json.image && (json.image.img || json.image.path))
                image = this.deserializeSvg(json.image);
            else if (json.image && json.image.src)
                image = this.deserializeIcon(json.image);
            else if (json.image)
                throw "unknown image type";
            if (json.text)
                text = this.deserializeText(json.text);
            if (json.fill)
                fill = this.deserializeFill(json.fill);
            if (json.stroke)
                stroke = this.deserializeStroke(json.stroke);
            var s = new ol.style.Style({
                image: image,
                text: text,
                fill: fill,
                stroke: stroke
            });
            image && s.setGeometry(function (feature) { return _this.getGeometry(feature); });
            return s;
        };
        StyleConverter.prototype.deserializeText = function (json) {
            var _a;
            json.rotation = json.rotation || 0;
            json.scale = json.scale || 1;
            var _b = [json["offset-x"] || 0, json["offset-y"] || 0], x = _b[0], y = _b[1];
            {
                var p = new ol.geom.Point([x, y]);
                p.rotate(json.rotation, [0, 0]);
                p.scale(json.scale, json.scale);
                _a = p.getCoordinates(), x = _a[0], y = _a[1];
            }
            return new ol.style.Text({
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke),
                text: json.text,
                font: json.font,
                offsetX: x,
                offsetY: y,
                rotation: json.rotation,
                scale: json.scale
            });
        };
        StyleConverter.prototype.deserializeCircle = function (json) {
            var image = new ol.style.Circle({
                radius: json.radius,
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke)
            });
            image.setOpacity(json.opacity);
            return image;
        };
        StyleConverter.prototype.deserializeStar = function (json) {
            var image = new ol.style.RegularShape({
                radius: json.radius,
                radius2: json.radius2,
                points: json.points,
                angle: json.angle,
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke)
            });
            doif_1.doif(json.rotation, function (v) { return image.setRotation(v); });
            doif_1.doif(json.opacity, function (v) { return image.setOpacity(v); });
            return image;
        };
        StyleConverter.prototype.deserializeIcon = function (json) {
            if (!json.anchor) {
                json.anchor = [json["anchor-x"] || 0.5, json["anchor-y"] || 0.5];
            }
            var image = new ol.style.Icon({
                anchor: json.anchor || [0.5, 0.5],
                anchorOrigin: json.anchorOrigin || "top-left",
                anchorXUnits: json.anchorXUnits || "fraction",
                anchorYUnits: json.anchorYUnits || "fraction",
                img: undefined,
                imgSize: undefined,
                offset: json.offset,
                offsetOrigin: json.offsetOrigin,
                opacity: json.opacity,
                scale: json.scale,
                snapToPixel: json.snapToPixel,
                rotateWithView: json.rotateWithView,
                rotation: json.rotation,
                size: json.size,
                src: json.src,
                color: json.color
            });
            image.load();
            return image;
        };
        StyleConverter.prototype.deserializeSvg = function (json) {
            var _a;
            json.rotation = json.rotation || 0;
            json.scale = json.scale || 1;
            if (json.img) {
                var symbol = document.getElementById(json.img);
                if (!symbol) {
                    throw "unable to find svg element: " + json.img;
                }
                if (symbol) {
                    var path = (symbol.getElementsByTagName("path")[0]);
                    if (path) {
                        if (symbol.viewBox) {
                            if (!json.imgSize) {
                                json.imgSize = [symbol.viewBox.baseVal.width, symbol.viewBox.baseVal.height];
                            }
                        }
                        json.path = (json.path || "") + path.getAttribute('d');
                    }
                }
            }
            var canvas = document.createElement("canvas");
            if (json.path) {
                {
                    _a = json.imgSize.map(function (v) { return v * json.scale; }), canvas.width = _a[0], canvas.height = _a[1];
                    if (json.stroke && json.stroke.width) {
                        var dx = 2 * json.stroke.width * json.scale;
                        canvas.width += dx;
                        canvas.height += dx;
                    }
                }
                var ctx = canvas.getContext('2d');
                var path2d = new Path2D(json.path);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(json.scale, json.scale);
                ctx.translate(-json.imgSize[0] / 2, -json.imgSize[1] / 2);
                if (json.fill) {
                    ctx.fillStyle = json.fill.color;
                    ctx.fill(path2d);
                }
                if (json.stroke) {
                    ctx.strokeStyle = json.stroke.color;
                    ctx.lineWidth = json.stroke.width;
                    ctx.stroke(path2d);
                }
            }
            var icon = new ol.style.Icon({
                img: canvas,
                imgSize: [canvas.width, canvas.height],
                rotation: json.rotation,
                scale: 1,
                anchor: json.anchor || [canvas.width / 2, canvas.height],
                anchorOrigin: json.anchorOrigin,
                anchorXUnits: json.anchorXUnits || "pixels",
                anchorYUnits: json.anchorYUnits || "pixels",
                offset: json.offset,
                offsetOrigin: json.offsetOrigin,
                opacity: json.opacity,
                snapToPixel: json.snapToPixel,
                rotateWithView: json.rotateWithView,
                size: [canvas.width, canvas.height],
                src: undefined
            });
            return mixin_1.mixin(icon, {
                path: json.path,
                stroke: json.stroke,
                fill: json.fill,
                scale: json.scale,
                imgSize: json.imgSize
            });
        };
        StyleConverter.prototype.deserializeFill = function (json) {
            var fill = new ol.style.Fill({
                color: json && this.deserializeColor(json)
            });
            return fill;
        };
        StyleConverter.prototype.deserializeStroke = function (json) {
            var stroke = new ol.style.Stroke();
            doif_1.doif(json.color, function (v) { return stroke.setColor(v); });
            doif_1.doif(json.lineCap, function (v) { return stroke.setLineCap(v); });
            doif_1.doif(json.lineDash, function (v) { return stroke.setLineDash(v); });
            doif_1.doif(json.lineJoin, function (v) { return stroke.setLineJoin(v); });
            doif_1.doif(json.miterLimit, function (v) { return stroke.setMiterLimit(v); });
            doif_1.doif(json.width, function (v) { return stroke.setWidth(v); });
            return stroke;
        };
        StyleConverter.prototype.deserializeColor = function (fill) {
            var _a;
            if (fill.color) {
                return fill.color;
            }
            if (fill.gradient) {
                var type = fill.gradient.type;
                var gradient_1;
                if (0 === type.indexOf("linear(")) {
                    gradient_1 = this.deserializeLinearGradient(fill.gradient);
                }
                else if (0 === type.indexOf("radial(")) {
                    gradient_1 = this.deserializeRadialGradient(fill.gradient);
                }
                if (fill.gradient.stops) {
                    mixin_1.mixin(gradient_1, {
                        stops: fill.gradient.stops
                    });
                    var stops = fill.gradient.stops.split(";");
                    stops = stops.map(function (v) { return v.trim(); });
                    stops.forEach(function (colorstop) {
                        var stop = colorstop.match(/ \d+%/m)[0];
                        var color = colorstop.substr(0, colorstop.length - stop.length);
                        gradient_1.addColorStop(parseInt(stop) / 100, color);
                    });
                }
                return gradient_1;
            }
            if (fill.pattern) {
                var repitition = fill.pattern.repitition;
                var canvas = document.createElement('canvas');
                var spacing = canvas.width = canvas.height = fill.pattern.spacing | 6;
                var context_1 = canvas.getContext('2d');
                context_1.fillStyle = fill.pattern.color;
                switch (fill.pattern.orientation) {
                    case "horizontal":
                        for (var i = 0; i < spacing; i++) {
                            context_1.fillRect(i, 0, 1, 1);
                        }
                        break;
                    case "vertical":
                        for (var i = 0; i < spacing; i++) {
                            context_1.fillRect(0, i, 1, 1);
                        }
                        break;
                    case "cross":
                        for (var i = 0; i < spacing; i++) {
                            context_1.fillRect(i, 0, 1, 1);
                            context_1.fillRect(0, i, 1, 1);
                        }
                        break;
                    case "forward":
                        for (var i = 0; i < spacing; i++) {
                            context_1.fillRect(i, i, 1, 1);
                        }
                        break;
                    case "backward":
                        for (var i = 0; i < spacing; i++) {
                            context_1.fillRect(spacing - 1 - i, i, 1, 1);
                        }
                        break;
                    case "diagonal":
                        for (var i = 0; i < spacing; i++) {
                            context_1.fillRect(i, i, 1, 1);
                            context_1.fillRect(spacing - 1 - i, i, 1, 1);
                        }
                        break;
                }
                return mixin_1.mixin(context_1.createPattern(canvas, repitition), fill.pattern);
            }
            if (fill.image) {
                var canvas = document.createElement('canvas');
                var _b = (_a = fill.image.imgSize, canvas.width = _a[0], canvas.height = _a[1], _a), w_1 = _b[0], h_1 = _b[1];
                var context_2 = canvas.getContext('2d');
                var _c = [0, 0], dx = _c[0], dy = _c[1];
                var image_1 = document.createElement("img");
                image_1.src = fill.image.imageData;
                image_1.onload = function () { return context_2.drawImage(image_1, 0, 0, w_1, h_1); };
                return "rgba(255,255,255,0.1)";
            }
            throw "invalid color configuration";
        };
        StyleConverter.prototype.deserializeLinearGradient = function (json) {
            var rx = /\w+\((.*)\)/m;
            var _a = JSON.parse(json.type.replace(rx, "[$1]")), x0 = _a[0], y0 = _a[1], x1 = _a[2], y1 = _a[3];
            var canvas = document.createElement('canvas');
            canvas.width = Math.max(x0, x1);
            canvas.height = Math.max(y0, y1);
            var context = canvas.getContext('2d');
            var gradient = context.createLinearGradient(x0, y0, x1, y1);
            mixin_1.mixin(gradient, {
                type: "linear(" + [x0, y0, x1, y1].join(",") + ")"
            });
            return gradient;
        };
        StyleConverter.prototype.deserializeRadialGradient = function (json) {
            var rx = /radial\((.*)\)/m;
            var _a = JSON.parse(json.type.replace(rx, "[$1]")), x0 = _a[0], y0 = _a[1], r0 = _a[2], x1 = _a[3], y1 = _a[4], r1 = _a[5];
            var canvas = document.createElement('canvas');
            canvas.width = 2 * Math.max(x0, x1);
            canvas.height = 2 * Math.max(y0, y1);
            var context = canvas.getContext('2d');
            var gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
            mixin_1.mixin(gradient, {
                type: "radial(" + [x0, y0, r0, x1, y1, r1].join(",") + ")"
            });
            return gradient;
        };
        return StyleConverter;
    }());
    exports.StyleConverter = StyleConverter;
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer", ["require", "exports", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, Symbolizer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var symbolizer = new Symbolizer.StyleConverter();
    var styleMap = {
        esriSMSCircle: "circle",
        esriSMSDiamond: "diamond",
        esriSMSX: "x",
        esriSMSCross: "cross",
        esriSLSSolid: "solid",
        esriSFSSolid: "solid",
        esriSLSDot: "dot",
        esriSLSDash: "dash",
        esriSLSDashDot: "dashdot",
        esriSLSDashDotDot: "dashdotdot",
        esriSFSBackwardDiagonal: "backward-diagonal",
        esriSFSForwardDiagonal: "forward-diagonal"
    };
    var typeMap = {
        esriSMS: "sms",
        esriSLS: "sls",
        esriSFS: "sfs",
        esriPMS: "pms",
        esriPFS: "pfs",
        esriTS: "txt"
    };
    function range(a, b) {
        var result = new Array(b - a + 1);
        while (a <= b)
            result.push(a++);
        return result;
    }
    function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }
    var StyleConverter = (function () {
        function StyleConverter() {
        }
        StyleConverter.prototype.asWidth = function (v) {
            return (v * 4) / 3;
        };
        StyleConverter.prototype.asColor = function (color) {
            if (color.length === 4)
                return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] / 255 + ")";
            if (color.length === 3)
                return "rgb(" + color[0] + "," + color[1] + "," + color[2] + "})";
            return "#" + color.map(function (v) { return ("0" + v.toString(16)).substr(0, 2); }).join("");
        };
        StyleConverter.prototype.fromSFSSolid = function (symbol, style) {
            style.fill = {
                color: this.asColor(symbol.color)
            };
            this.fromSLS(symbol.outline, style);
        };
        StyleConverter.prototype.fromSFSForwardDiagonal = function (symbol, style) {
            style.fill = {
                pattern: {
                    color: this.asColor(symbol.color),
                    orientation: "forward",
                    spacing: 3,
                    repitition: "repeat"
                }
            };
            this.fromSLS(symbol.outline, style);
        };
        StyleConverter.prototype.fromSFSBackwardDiagonal = function (symbol, style) {
            style.fill = {
                pattern: {
                    color: this.asColor(symbol.color),
                    orientation: "backward",
                    spacing: 3,
                    repitition: "repeat"
                }
            };
            this.fromSLS(symbol.outline, style);
        };
        StyleConverter.prototype.fromSFS = function (symbol, style) {
            switch (symbol.style) {
                case "esriSFSSolid":
                    this.fromSFSSolid(symbol, style);
                    break;
                case "esriSFSForwardDiagonal":
                    this.fromSFSForwardDiagonal(symbol, style);
                    break;
                case "esriSFSBackwardDiagonal":
                    this.fromSFSBackwardDiagonal(symbol, style);
                    break;
                default:
                    throw "invalid-style: " + symbol.style;
            }
        };
        StyleConverter.prototype.fromSMSCircle = function (symbol, style) {
            style.circle = {
                opacity: 1,
                radius: this.asWidth(symbol.size / 2),
                stroke: {
                    color: this.asColor(symbol.outline.color)
                },
                snapToPixel: true
            };
            this.fromSFSSolid(symbol, style.circle);
            this.fromSLS(symbol.outline, style.circle);
        };
        StyleConverter.prototype.fromSMSCross = function (symbol, style) {
            style.star = {
                points: 4,
                angle: 0,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: 0
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMSDiamond = function (symbol, style) {
            style.star = {
                points: 4,
                angle: 0,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: this.asWidth(symbol.size / Math.sqrt(2))
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMSPath = function (symbol, style) {
            var size = 2 * this.asWidth(symbol.size);
            style.svg = {
                imgSize: [size, size],
                path: symbol.path,
                rotation: symbol.angle
            };
            this.fromSLSSolid(symbol, style.svg);
            this.fromSLS(symbol.outline, style.svg);
        };
        StyleConverter.prototype.fromSMSSquare = function (symbol, style) {
            style.star = {
                points: 4,
                angle: Math.PI / 4,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: this.asWidth(symbol.size / Math.sqrt(2))
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMSX = function (symbol, style) {
            style.star = {
                points: 4,
                angle: Math.PI / 4,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: 0
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMS = function (symbol, style) {
            switch (symbol.style) {
                case "esriSMSCircle":
                    this.fromSMSCircle(symbol, style);
                    break;
                case "esriSMSCross":
                    this.fromSMSCross(symbol, style);
                    break;
                case "esriSMSDiamond":
                    this.fromSMSDiamond(symbol, style);
                    break;
                case "esriSMSPath":
                    this.fromSMSPath(symbol, style);
                    break;
                case "esriSMSSquare":
                    this.fromSMSSquare(symbol, style);
                    break;
                case "esriSMSX":
                    this.fromSMSX(symbol, style);
                    break;
                default:
                    throw "invalid-style: " + symbol.style;
            }
        };
        StyleConverter.prototype.fromPMS = function (symbol, style) {
            style.image = {};
            style.image.src = symbol.url;
            if (symbol.imageData) {
                style.image.src = "data:image/png;base64," + symbol.imageData;
            }
            style.image["anchor-x"] = this.asWidth(symbol.xoffset);
            style.image["anchor-y"] = this.asWidth(symbol.yoffset);
            style.image.imgSize = [this.asWidth(symbol.width), this.asWidth(symbol.height)];
        };
        StyleConverter.prototype.fromSLSSolid = function (symbol, style) {
            style.stroke = {
                color: this.asColor(symbol.color),
                width: this.asWidth(symbol.width),
                lineDash: [],
                lineJoin: "",
                miterLimit: 4
            };
        };
        StyleConverter.prototype.fromSLS = function (symbol, style) {
            switch (symbol.style) {
                case "esriSLSSolid":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDot":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDash":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDashDot":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDashDotDot":
                    this.fromSLSSolid(symbol, style);
                    break;
                default:
                    this.fromSLSSolid(symbol, style);
                    console.warn("invalid-style: " + symbol.style);
                    break;
            }
        };
        StyleConverter.prototype.fromPFS = function (symbol, style) {
            style.fill = {
                image: {
                    src: symbol.url,
                    imageData: symbol.imageData && "data:image/png;base64," + symbol.imageData,
                    "anchor-x": this.asWidth(symbol.xoffset),
                    "anchor-y": this.asWidth(symbol.yoffset),
                    imgSize: [this.asWidth(symbol.width), this.asWidth(symbol.height)]
                }
            };
            this.fromSLS(symbol.outline, style);
        };
        StyleConverter.prototype.fromTS = function (symbol, style) {
            throw "not-implemented";
        };
        StyleConverter.prototype.fromJson = function (symbol) {
            var style = {};
            this.fromSymbol(symbol, style);
            return symbolizer.fromJson(style);
        };
        StyleConverter.prototype.fromSymbol = function (symbol, style) {
            switch (symbol.type) {
                case "esriSFS":
                    this.fromSFS(symbol, style);
                    break;
                case "esriSLS":
                    this.fromSLS(symbol, style);
                    break;
                case "esriPMS":
                    this.fromPMS(symbol, style);
                    break;
                case "esriPFS":
                    this.fromPFS(symbol, style);
                    break;
                case "esriSMS":
                    this.fromSMS(symbol, style);
                    break;
                case "esriTS":
                    this.fromTS(symbol, style);
                    break;
                default:
                    throw "invalid-symbol-type: " + symbol.type;
            }
        };
        StyleConverter.prototype.fromRenderer = function (renderer, args) {
            var _this = this;
            switch (renderer.type) {
                case "simple": {
                    return this.fromJson(renderer.symbol);
                }
                case "uniqueValue": {
                    var styles_1 = {};
                    var defaultStyle_1 = renderer.defaultSymbol && this.fromJson(renderer.defaultSymbol);
                    if (renderer.uniqueValueInfos) {
                        renderer.uniqueValueInfos.forEach(function (info) {
                            styles_1[info.value] = _this.fromJson(info.symbol);
                        });
                    }
                    return function (feature) { return styles_1[feature.get(renderer.field1)] || defaultStyle_1; };
                }
                case "classBreaks": {
                    var styles_2 = {};
                    var classBreakRenderer_1 = renderer;
                    if (classBreakRenderer_1.classBreakInfos) {
                        console.log("processing classBreakInfos");
                        if (classBreakRenderer_1.visualVariables) {
                            classBreakRenderer_1.visualVariables.forEach(function (vars) {
                                switch (vars.type) {
                                    case "sizeInfo": {
                                        var steps_1 = range(classBreakRenderer_1.authoringInfo.visualVariables[0].minSliderValue, classBreakRenderer_1.authoringInfo.visualVariables[0].maxSliderValue);
                                        var dx_1 = (vars.maxSize - vars.minSize) / steps_1.length;
                                        var dataValue_1 = (vars.maxDataValue - vars.minDataValue) / steps_1.length;
                                        classBreakRenderer_1.classBreakInfos.forEach(function (classBreakInfo) {
                                            var icons = steps_1.map(function (step) {
                                                var json = (JSON.parse(JSON.stringify(classBreakInfo.symbol)));
                                                json.size = vars.minSize + dx_1 * (dataValue_1 - vars.minDataValue);
                                                var style = _this.fromJson(json);
                                                styles_2[dataValue_1] = style;
                                            });
                                        });
                                        debugger;
                                        break;
                                    }
                                    default:
                                        debugger;
                                        break;
                                }
                            });
                        }
                    }
                    return function (feature) {
                        debugger;
                        var value = feature.get(renderer.field1);
                        for (var key in styles_2) {
                            return styles_2[key];
                        }
                        return null;
                    };
                }
                default:
                    throw "unsupported renderer type: " + renderer.type;
            }
        };
        return StyleConverter;
    }());
    exports.StyleConverter = StyleConverter;
});
define("node_modules/ol3-symbolizer/index", ["require", "exports", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, Symbolizer, ags_symbolizer_1, ol3_symbolizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Symbolizer = Symbolizer;
    exports.AgsStyleConverter = ags_symbolizer_1.StyleConverter;
    exports.StyleConverter = ol3_symbolizer_1.StyleConverter;
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
            var _a = [style.width, style.height].map(function (n) { return parseInt(n); }).map(function (n) { return (isNaN(n) ? threshold : n); }), w = _a[0], h = _a[1];
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
        verticalPosition = verticalPosition || (distanceToTop < distanceToBottom ? "top" : "bottom");
        return verticalPosition + "-" + horizontalPosition;
    }
    exports.smartpick = smartpick;
});
define("ol3-popup/ol3-popup", ["require", "exports", "openlayers", "ol3-popup/paging/paging", "ol3-popup/paging/page-navigator", "node_modules/ol3-fun/ol3-fun/common", "ol3-popup/interaction", "node_modules/ol3-symbolizer/index", "ol3-popup/commands/smartpick", "node_modules/ol3-symbolizer/ol3-symbolizer/common/mixin"], function (require, exports, ol, paging_1, page_navigator_1, common_4, interaction_1, Symbolizer, smartpick_1, mixin_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var symbolizer = new Symbolizer.Symbolizer.StyleConverter();
    var css = "\n.ol-popup {\n}\n\n.ol-popup.hidden {\n    display: none;\n}\n\n.ol-popup-element.docked {\n    position:absolute;\n    bottom:0;\n    top:0;\n    left:0;\n    right:0;\n    width:auto;\n    height:auto;\n    pointer-events: all;\n}\n\n.ol-popup-element.docked:after {\n    display:none;\n}\n\n.ol-popup-element.docked .pages {\n    max-height: inherit;\n    overflow: auto;\n    height: calc(100% - 60px);\n}\n\n.ol-popup-element.docked .pagination {\n    position: absolute;\n    bottom: 0;\n}\n\n.ol-popup .pagination .btn-prev::after {\n    content: \"\u21E6\"; \n}\n\n.ol-popup .pagination .btn-next::after {\n    content: \"\u21E8\"; \n}\n\n.ol-popup .pagination.hidden {\n    display: none;\n}\n\n.ol-popup-element .pagination .btn-prev::after {\n    content: \"\u21E6\"; \n}\n\n.ol-popup-element .pagination .btn-next::after {\n    content: \"\u21E8\"; \n}\n\n.ol-popup-element .pagination.hidden {\n    display: none;\n}\n\n.ol-popup-element .ol-popup-closer {\n    border: none;\n    background: transparent;\n    color: inherit;\n    position: absolute;\n    top: 0;\n    right: 0;\n    text-decoration: none;\n}\n    \n.ol-popup-element .ol-popup-closer:after {\n    content:'\u2716';\n}\n\n.ol-popup .ol-popup-docker {\n    border: none;\n    background: transparent;\n    color: inherit;\n    text-decoration: none;\n    position: absolute;\n    top: 0;\n    right: 20px;\n}\n\n.ol-popup .ol-popup-docker:after {\n    content:'\u25A1';\n}\n\n.popup-indicator {\n\tcolor: inherit;\n\tfont-size: 2em;\n\tfont-family: monospace;\n}\n";
    var baseStyle = symbolizer.fromJson({
        circle: {
            fill: {
                color: "rgba(255,0,0,1)"
            },
            opacity: 1,
            stroke: {
                color: "rgba(255,255,255,1)",
                width: 1
            },
            radius: 3
        }
    });
    var classNames = {
        olPopup: "ol-popup",
        olPopupDocker: "ol-popup-docker",
        olPopupCloser: "ol-popup-closer",
        olPopupContent: "ol-popup-content",
        olPopupElement: "ol-popup-element",
        hidden: "hidden",
        docked: "docked"
    };
    var eventNames = {
        dispose: "dispose",
        dock: "dock",
        hide: "hide",
        show: "show",
        undock: "undock"
    };
    function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }
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
                            color: isActive ? "white" : "black"
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
    exports.TRIANGLES = {
        "bottom-left": "▽",
        "bottom-center": "▽",
        "bottom-right": "▽",
        "center-left": "◁",
        "center-center": "",
        "center-right": "▷",
        "top-left": "△",
        "top-center": "△",
        "top-right": "△"
    };
    exports.DIAMONDS = {
        "bottom-left": "♢",
        "bottom-center": "♢",
        "bottom-right": "♢",
        "center-left": "♢",
        "center-center": "",
        "center-right": "♢",
        "top-left": "♢",
        "top-center": "♢",
        "top-right": "♢"
    };
    exports.DEFAULT_OPTIONS = {
        id: "popup",
        map: null,
        pagingStyle: null,
        asContent: asContent,
        multi: false,
        autoPan: true,
        autoPopup: true,
        autoPanMargin: 20,
        autoPositioning: true,
        className: classNames.olPopup,
        indicators: exports.TRIANGLES,
        indicatorOffsets: {
            "bottom-left": [15, 23],
            "bottom-center": [0, 23],
            "bottom-right": [15, 23],
            "center-left": [15, 0],
            "center-center": [0, 0],
            "center-right": [15, 0],
            "top-left": [15, 23],
            "top-center": [0, 23],
            "top-right": [15, 23]
        },
        css: "\n.ol-popup {\n    background-color: white;\n    border: 1px solid black;\n    padding: 4px;\n    padding-top: 24px;\n}\n.ol-popup .ol-popup-content {\n    overflow: auto;\n    min-width: 120px;\n    max-width: 360px;\n    max-height: 240px;\n}\n.ol-popup .pages {\n    overflow: auto;\n    max-width: 360px;\n    max-height: 240px;\n}\n.ol-popup .ol-popup-closer {\n    right: 4px;\n}\n".trim(),
        insertFirst: true,
        pointerPosition: 20,
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
            try {
                _this.configureDom(options);
                _this.configureDockerButton(_this.domNode);
                _this.configureCloserButton(_this.domNode);
                _this.configureContentContainer();
                _this.configurePaging();
                _this.configureAutoPopup();
            }
            catch (ex) {
                _this.destroy();
                throw ex;
            }
            return _this;
        }
        Popup.create = function (options) {
            options = common_4.defaults({}, options || {}, clone(exports.DEFAULT_OPTIONS), {
                pagingStyle: exports.DEFAULT_OPTIONS.pagingStyle,
                asContent: exports.DEFAULT_OPTIONS.asContent
            });
            var popup = new Popup(options);
            options.map && options.map.addOverlay(popup);
            return popup;
        };
        Popup.prototype.configureDom = function (options) {
            this.handlers.push(common_4.cssin("ol3-popup", css));
            options.css && this.injectCss("options", options.css);
            var domNode = (this.domNode = document.createElement("div"));
            domNode.className = classNames.olPopupElement;
            this.setElement(domNode);
            this.handlers.push(function () { return domNode.remove(); });
        };
        Popup.prototype.configureContentContainer = function () {
            var content = (this.content = document.createElement("div"));
            content.className = classNames.olPopupContent;
            this.domNode.appendChild(content);
        };
        Popup.prototype.configureDockerButton = function (domNode) {
            var _this = this;
            if (!this.options.dockContainer)
                return;
            var docker = (this.docker = document.createElement("label"));
            docker.title = "docker";
            docker.className = classNames.olPopupDocker;
            domNode.appendChild(docker);
            docker.addEventListener("click", function (evt) {
                _this.isDocked() ? _this.undock() : _this.dock();
                evt.preventDefault();
            }, false);
        };
        Popup.prototype.configureCloserButton = function (domNode) {
            var _this = this;
            var closer = (this.closer = document.createElement("label"));
            closer.title = "closer";
            closer.className = classNames.olPopupCloser;
            domNode.appendChild(closer);
            closer.addEventListener("click", function (evt) {
                _this.isDocked() ? _this.undock() : _this.hide();
                evt.preventDefault();
            }, false);
        };
        Popup.prototype.configurePaging = function () {
            var _this = this;
            var pages = (this.pages = new paging_1.Paging({ popup: this }));
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
            if (!this.options.map)
                throw "autoPopup feature requires map option";
            var autoPopup = interaction_1.SelectInteraction.create({
                popup: this,
                buffer: 4
            });
            this.on("change:active", function () {
                autoPopup.set("active", _this.get("active"));
            });
            this.handlers.push(function () { return autoPopup.destroy(); });
        };
        Popup.prototype.injectCss = function (id, css) {
            if (!this.getId())
                throw "cannot injects css on an overlay with no assigned id";
            id = this.getId() + "_" + id;
            this.handlers.push(common_4.cssin(id, css));
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
                    autoPanAnimation: this.options.autoPanAnimation
                });
                this.options.map.addOverlay(indicator);
            }
            var indicatorElement = this.options.indicators[this.getPositioning()];
            if (typeof indicatorElement === "string")
                indicatorElement = common_4.html("<div class=\"popup-indicator " + this.getPositioning()
                    .split("-")
                    .join(" ") + "\">" + indicatorElement + "</div>");
            indicator.setElement(indicatorElement);
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
            var pos = this.getPositioning();
            var _a = pos.split("-", 2), verticalPosition = _a[0], horizontalPosition = _a[1];
            {
                var el = this.element;
                el.classList.toggle("center", verticalPosition === "center" || horizontalPosition === "center");
                el.classList.toggle("top", verticalPosition === "top");
                el.classList.toggle("bottom", verticalPosition === "bottom");
                el.classList.toggle("left", horizontalPosition === "left");
                el.classList.toggle("right", horizontalPosition === "right");
            }
            var indicator = this.showIndicator();
            var _b = [this.options.indicatorOffsets[pos][0], this.options.indicatorOffsets[pos][1]], dx = _b[0], dy = _b[1];
            switch (verticalPosition) {
                case "top":
                    {
                        indicator.setPositioning("top-center");
                        indicator.setOffset([0, 0 + offset]);
                        switch (horizontalPosition) {
                            case "center":
                                this.setOffset([dx, dy + offset]);
                                break;
                            case "left":
                                this.setOffset([-dx, dy + offset]);
                                break;
                            case "right":
                                this.setOffset([dx, dy + offset]);
                                break;
                            default:
                                throw "unknown value: " + horizontalPosition;
                        }
                    }
                    break;
                case "bottom":
                    {
                        indicator.setOffset([0, 0 - offset]);
                        indicator.setPositioning("bottom-center");
                        switch (horizontalPosition) {
                            case "center":
                                this.setOffset([dx, -(dy + offset)]);
                                break;
                            case "left":
                                this.setOffset([-dx, -(dy + offset)]);
                                break;
                            case "right":
                                this.setOffset([dx, -(dy + offset)]);
                                break;
                            default:
                                throw "unknown value: " + horizontalPosition;
                        }
                    }
                    break;
                case "center":
                    {
                        switch (horizontalPosition) {
                            case "center":
                                indicator.setPosition(null);
                                break;
                            case "left": {
                                indicator.setOffset([offset, 0]);
                                indicator.setPositioning("center-left");
                                this.setOffset([dx + offset, dy]);
                                break;
                            }
                            case "right": {
                                indicator.setOffset([-offset, 0]);
                                indicator.setPositioning("center-right");
                                this.setOffset([-(dx + offset), dy]);
                                break;
                            }
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
                this.options.autoPanAnimation && mixin_2.mixin(animation, this.options.autoPanAnimation.duration);
                view.animate(animation);
            }
        };
        Popup.prototype.panIntoView = function () {
            if (!this.isOpened())
                return;
            if (this.isDocked())
                return;
            var p = this.getPosition();
            p && this.setPosition(p.map(function (v) { return v; }));
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
                this.element.style.display = "";
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
define("examples/extras/feature-creator", ["require", "exports", "openlayers", "node_modules/ol3-symbolizer/index"], function (require, exports, ol, index_1) {
    "use strict";
    var symbolizer = new index_1.Symbolizer.StyleConverter();
    function random(center, scale) {
        if (scale === void 0) { scale = 1000; }
        return [center[0] + scale * Math.random(), center[1] + scale * Math.random()];
    }
    function translate(center, t) {
        return [center[0] + t[0], center[1] + t[1]];
    }
    function setStyle(feature, json) {
        var style = symbolizer.fromJson(json);
        feature.setStyle(style);
        return style;
    }
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
                event = event.mapBrowserEvent || event;
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
        FeatureCreator.create = function (options) {
            return new FeatureCreator(options);
        };
        FeatureCreator.prototype.addSomeFeatures = function (vectorLayer, center) {
            var circleFeature = new ol.Feature({
                id: 123,
                foo: "foo",
                bar: "bar",
            });
            circleFeature.setGeometry(new ol.geom.Point(random(center, 100)));
            var style = {
                "circle": {
                    "fill": {
                        "color": "rgba(255,0,0,0.90)"
                    },
                    "opacity": 1,
                    "stroke": {
                        "color": "rgba(0,0,0,1)",
                        "width": 1
                    },
                    "radius": 6
                }
            };
            setStyle(circleFeature, style);
            var svgFeature = new ol.Feature({
                id: 123,
                foo: "foo",
                bar: "bar",
            });
            svgFeature.setGeometry(new ol.geom.Point(random(translate(center, [1000, 0]))));
            setStyle(svgFeature, {
                "image": {
                    "imgSize": [36, 36],
                    "anchor": [32, 32],
                    "stroke": {
                        "color": "rgba(128,25,0,0.8)",
                        "width": 10
                    },
                    "path": "M23 2 L23 23 L43 16.5 L23 23 L35 40 L23 23 L11 40 L23 23 L3 17 L23 23 L23 2 Z"
                }
            });
            var markerFeature = new ol.Feature({
                id: 123,
                foo: "foo",
                bar: "bar",
            });
            var triangle1 = random(translate(center, [1000, 1000]));
            markerFeature.setGeometry(new ol.geom.Polygon([[
                    triangle1,
                    random(center, 1000),
                    random(center, 1000),
                    triangle1
                ]]));
            setStyle(markerFeature, {
                "fill": {
                    "color": "rgba(255,255,0, 0.8)",
                },
                "stroke": {
                    "color": "rgba(0,255,0,1)",
                    "width": 1
                }
            });
            var markerFeature2 = new ol.Feature({
                id: 123,
                foo: "foo",
                UserIdentification: "foo.bar@foobar.org",
            });
            markerFeature2.setGeometry(new ol.geom.Point(random(translate(center, [0, 1000]))));
            setStyle(markerFeature2, {
                "circle": {
                    "fill": {
                        color: "rgba(100,100,100,0.5)"
                    },
                    "opacity": 1,
                    "stroke": {
                        "color": "rgba(100,100,100,1)",
                        "width": 8
                    },
                    "radius": 32
                }
            });
            vectorLayer.getSource().addFeatures([
                circleFeature,
                svgFeature,
                markerFeature,
                markerFeature2
            ]);
            return this;
        };
        return FeatureCreator;
    }());
    return FeatureCreator;
});
define("examples/activate", ["require", "exports", "openlayers", "ol3-popup/ol3-popup", "node_modules/ol3-fun/ol3-fun/common", "examples/extras/feature-creator"], function (require, exports, ol, ol3_popup_1, common_5, FeatureCreator) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var css = "\nhead, body {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.map {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n.map .toggle-active {\n    position: absolute;\n    top: 1em;\n    left: 3em;\n    z-index: 1;\n}\n";
    var popupCss = "\n.ol-popup {\n    background-color: white;\n    padding: 4px;\n    padding-top: 24px;\n    border: 1px solid rgba(0, 0, 0, 1);\n}\n.pagination {\n    min-width: 160px;\n}\n.pagination .page-num {\n    min-width: 100px;\n    display: inline-block;\n    text-align: center; \n}\n.pagination .arrow.btn-next {\n    float: right;\n}";
    var html = "\n<div class=\"map\">\n    <input type=\"button\" class=\"toggle-active\" value=\"Toggle Popup\"></input>\n</div>\n";
    var center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');
    function run() {
        common_5.cssin("activate", css);
        document.body.appendChild(common_5.html("<div>" + html + "</div>"));
        var mapContainer = document.getElementsByClassName("map")[0];
        var map = new ol.Map({
            target: mapContainer,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                projection: "EPSG:3857",
                center: center,
                zoom: 16
            })
        });
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        map.addLayer(vectorLayer);
        FeatureCreator
            .create({ map: map })
            .addSomeFeatures(vectorLayer, center);
        var popup = ol3_popup_1.Popup.create({
            map: map,
            css: popupCss,
            layers: [vectorLayer]
        });
        popup.set("active", false);
        var toggleButton = document.getElementsByClassName("toggle-active")[0];
        toggleButton.addEventListener("click", function () { return popup.set("active", !popup.get("active")); });
    }
    exports.run = run;
});
define("examples/docking", ["require", "exports", "openlayers", "jquery", "ol3-popup/ol3-popup", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, ol, $, ol3_popup_2, common_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var css = "\nhead, body {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.map {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n";
    var css_popup = "\n\n.dock-container {\n    position: absolute;\n    top: 20px;\n    right: 20px;\n    width: 200px;\n    height: 200px;\n    border: 1px solid rgba(0,0,0,0.05);\n    display: inline-block;\n    padding: 20px;\n    background: transparent;\n    pointer-events: none;\n}\n\n.ol-popup {\n    width: 300px;\n    min-height: 50px;\n    background: white;\n    color: black;\n    border: 4px solid black;\n    border-radius: 12px;\n}\n\n.ol-popup:after {\n    border-top-color: black;\n}\n\n.ol-popup .ol-popup-content {\n    padding: 0;\n}\n\n.ol-popup .ol-popup-content > *:first-child {\n    margin-right: 36px;\n    overflow: hidden;\n    display: block;\n}\n\n.ol-popup .pagination button {\n    border:none;\n    background:transparent;\n}\n\n.ol-popup .ol-popup-docker {\n    width: 24px;\n    height: 24px;\n    text-align: center;\n}\n\n.ol-popup-element .ol-popup-closer {\n    width: 24px;\n    height: 24px;    \n    text-align: center;\n    border-top-right-radius: 8px;\n}\n\n.ol-popup-element .ol-popup-closer:hover {\n    background-color: red;\n    color: white;\n}\n\n.ol-popup .ol-popup-docker:hover {\n    background-color: #999;\n    color: white;\n}\n\n.ol-popup .ol-popup-content > *:first-child {\n    margin-right: 40px;\n}\n\n.ol-popup .arrow.active:hover {\n    background-color: #999;\n    color: white;    \n}\n\n";
    var html = "\n<div class=\"map\"></div>\n<div class='dock-container'></div>\n";
    var center = ol.proj.transform([-85, 35], "EPSG:4326", "EPSG:3857");
    function run() {
        $(document.head).append(common_6.html("<style name=\"paging\" type='text/css'>" + css + "</style>"));
        $(document.body).append(common_6.html("<div>" + html + "</div>"));
        var mapContainer = document.getElementsByClassName("map")[0];
        var dockContainer = document.getElementsByClassName("dock-container")[0];
        var map = new ol.Map({
            target: mapContainer,
            layers: [],
            view: new ol.View({
                center: center,
                zoom: 6
            })
        });
        var p1 = ol3_popup_2.Popup.create({
            map: map,
            autoPan: true,
            autoPanMargin: 20,
            autoPanAnimation: {
                source: null,
                duration: 500
            },
            autoPopup: true,
            showCoordinates: true,
            css: css_popup,
            dockContainer: dockContainer,
            pointerPosition: 15,
            multi: true
        });
        0 &&
            p1.on("dock", common_6.debounce(function () {
                var h = p1.on("show", function () {
                    var p = ol3_popup_2.Popup.create({
                        map: map,
                        autoPopup: false,
                        positioning: "top-center",
                        asContent: function (feature) { return common_6.html("<b>Hi " + feature.get("hello") + "</b>"); }
                    });
                    p1.once(["undock", "dispose"], function () { return p.destroy(); });
                    var feature = new ol.Feature({
                        hello: "Hello",
                        geometry: new ol.geom.Point(p1.options.position)
                    });
                    p.pages.addFeature(feature, { searchCoordinate: p1.options.position });
                    p.pages.goto(0);
                });
                p1.once(["undock", "dispose"], function () { return ol.Observable.unByKey(h); });
            }));
        map.once("postrender", function (event) {
            p1.show(center, "Docking...");
            setTimeout(function () {
                p1.dock();
                p1.show(center, "Docked");
                setTimeout(function () {
                    p1.undock();
                    p1.show(center, "Undocked");
                }, 1000);
            }, 1000);
        });
    }
    exports.run = run;
});
define("examples/multi", ["require", "exports", "openlayers", "ol3-popup/ol3-popup", "node_modules/ol3-symbolizer/index", "node_modules/ol3-fun/ol3-fun/common", "examples/extras/feature-creator"], function (require, exports, ol, ol3_popup_3, Symbolizer, common_7, FeatureCreator) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var symbolizer = new Symbolizer.Symbolizer.StyleConverter();
    var css = "\nhead, body {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.map {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n";
    var popupCss = "\n.ol-popup {\n    background-color: white;\n    padding: 4px;\n    padding-top: 24px;\n    border: 1px solid rgba(0, 0, 0, 1);\n}\n.pagination {\n    min-width: 160px;\n}\n.pagination .page-num {\n    min-width: 100px;\n    display: inline-block;\n    text-align: center; \n}\n.pagination .arrow.btn-next {\n    float: right;\n}\ndiv.map > label {\n    position: absolute;\n    top: 10px;\n    left: 60px;\n    z-index: 1;\n}\n";
    var html = "\n<div class=\"map\">\n<label>Hold the shift key down when clicking the marker to multi-select, need to click a little left of the markers..it's looking at feature coordinates not symbols (but still a bit off)</label>\n</div>\n";
    var center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');
    function run() {
        common_7.cssin("multi", css);
        document.body.appendChild(common_7.html("<div>" + html + "</div>"));
        var mapContainer = document.getElementsByClassName("map")[0];
        var map = new ol.Map({
            target: mapContainer,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: center,
                zoom: 16
            })
        });
        var popup = ol3_popup_3.Popup.create({
            map: map,
            multi: true,
            css: popupCss,
            pagingStyle: function (feature, resolution, pageIndex) {
                return [symbolizer.fromJson({
                        "circle": {
                            "fill": {
                                "color": "rgba(255,0,0,1)"
                            },
                            "opacity": 1,
                            "stroke": {
                                "color": "rgba(255,255,255,1)",
                                "width": 5
                            },
                            "radius": 25
                        },
                        text: {
                            text: "" + (pageIndex + 1),
                            fill: {
                                color: "white",
                            },
                            stroke: {
                                color: "black",
                                width: 2
                            },
                            scale: 3,
                            "offset-y": 0
                        }
                    })];
            },
            asContent: function (feature) {
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
                div.innerHTML = "<table>" + keys.map(function (k) { return "<tr><td><b>" + k + "</b></td><td><i>" + feature.get(k) + "</i></td></tr>"; }).join("") + "</table>";
                return div;
            },
        });
        popup.on("change:active", function () { return console.log("change:active"); });
        popup.on("hide", function () { return console.log("hide"); });
        popup.on("show", function () { return console.log("show", popup.content.outerHTML); });
        popup.on("dispose", function () { return console.log("dispose"); });
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        map.addLayer(vectorLayer);
        FeatureCreator
            .create({ map: map })
            .addSomeFeatures(vectorLayer, center);
    }
    exports.run = run;
});
define("examples/overlay", ["require", "exports", "openlayers", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, ol, common_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var css = "\nhead, body {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.map {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n.ol-control.simple-infobox {\n    top: 1em;\n    left: 25%;\n    max-width: 50%;\n  }\n\n.simple-popup {\n    border: 1px solid black;\n    border-radius: 4px;\n    padding: 10px;\n    background-color: rgba(80, 80, 80, 0.5);\n    color: rgb(250, 250, 250);\n    max-width: 120px;\n}\n\n.simple-popup-arrow {\n    color: black;\n    font-size: 36px;\n}\n\n.simple-popup-down-arrow:after {\n    content: \"\u21E9\";\n    position: relative;\n    top: -8px;\n}\n\n.simple-popup-up-arrow:after {\n    content: \"\u21E7\";\n    position: relative;\n    top: 10px;\n}\n\n.simple-popup-left-arrow:after {\n    content: \"\u21E6\";\n}\n\n.simple-popup-right-arrow:after {\n    content: \"\u21E8\";\n}\n\n";
    var html = "\n<div class=\"map\"></div>\n";
    var center = ol.proj.transform([-85, 35], 'EPSG:4326', 'EPSG:3857');
    function run() {
        common_8.cssin("simple", css);
        document.body.appendChild(common_8.html("<div>" + html + "</div>"));
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        var map = new ol.Map({
            target: document.getElementsByClassName("map")[0],
            layers: [vectorLayer],
            view: new ol.View({
                projection: "EPSG:3857",
                center: center,
                zoom: 16
            })
        });
        {
            var message = "the purpose of this example is to show the techniques and complexities of creating a popup control";
            map.addControl(new ol.control.Control({
                element: common_8.html("<div class=\"simple-infobox ol-unselectable ol-control\"><label>" + message + "</label></div>"),
            }));
        }
        var marker = new ol.Overlay({
            autoPan: true,
            position: center,
            positioning: "center-center",
            element: common_8.html("<div class=\"ol-unselectable\" border=\"1px solid red\">\u274C</div>"),
        });
        map.addOverlay(marker);
        var topOverlay = new ol.Overlay({
            autoPan: true,
            position: center,
            positioning: "bottom-center",
            element: common_8.html("<div class=\"ol-unselectable\" style=\"text-align: center\"><div class=\"simple-popup\">Overlay with positioning set to bottom-center</div><span class=\"simple-popup-arrow simple-popup-down-arrow\"></span></div>"),
        });
        map.addOverlay(topOverlay);
        var bottomOverlay = new ol.Overlay({
            autoPan: true,
            position: center,
            positioning: "top-center",
            element: common_8.html("<div class=\"ol-unselectable\" style=\"text-align: center\"><span class=\"simple-popup-arrow simple-popup-up-arrow\"></span><div class=\"simple-popup\">Overlay with positioning set to top-center</div>"),
        });
        map.addOverlay(bottomOverlay);
    }
    exports.run = run;
});
define("examples/extras/map-maker", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function MapMaker(mapContainer) {
        return new ol.Map({
            target: mapContainer,
            layers: [],
            view: new ol.View({
                center: [0, 0],
                zoom: 6
            })
        });
    }
    exports.MapMaker = MapMaker;
});
define("examples/paging", ["require", "exports", "openlayers", "ol3-popup/ol3-popup", "examples/extras/feature-creator", "node_modules/ol3-fun/index", "jquery", "examples/extras/map-maker", "node_modules/ol3-fun/ol3-fun/slowloop"], function (require, exports, ol, ol3_popup_4, FeatureCreator, index_2, $, map_maker_1, slowloop_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var css = "\n";
    function circle(radius, points) {
        if (radius === void 0) { radius = 1; }
        if (points === void 0) { points = 36; }
        if (points < 3)
            throw "a circle must contain at least three points";
        if (radius <= 0)
            throw "a circle must have a positive radius";
        var a = 0;
        var dr = (2 * Math.PI) / (points - 1);
        var result = new Array(points);
        for (var i = 0; i < points - 1; i++) {
            result[i] = [radius * Math.sin(a), radius * Math.cos(a)];
            a += dr;
        }
        result[result.length - 1] = result[0];
        return result;
    }
    var css_popup = "\n\n.dock-container {\n    position: absolute;\n    top: 20px;\n    right: 20px;\n    width: 200px;\n    height: 300px;\n    border: 1px solid rgba(0,0,0,0.1);\n    display: inline-block;\n    padding: 20px;\n    background: transparent;\n    pointer-events: none;\n}\n\n.ol-popup {\n    width: 300px;\n    min-height: 50px;\n    background: white;\n    color: black;\n    border: 4px solid black;\n    border-radius: 12px;\n}\n\n.ol-popup:after {\n    border-top-color: black;\n}\n\n.ol-popup .ol-popup-content {\n    padding: 0;\n}\n\n.ol-popup .ol-popup-content > *:first-child {\n    margin-right: 36px;\n    overflow: hidden;\n    display: block;\n}\n\n.ol-popup .pagination button {\n    border:none;\n    background:transparent;\n}\n\n.ol-popup .ol-popup-closer {\n    width: 24px;\n    height: 24px;    \n    text-align: center;\n    border-top-right-radius: 8px;\n}\n\n.ol-popup .ol-popup-docker {\n    width: 24px;\n    height: 24px;\n    text-align: center;\n}\n\n.ol-popup .ol-popup-closer:hover {\n    background-color: red;\n    color: white;\n}\n\n.ol-popup .ol-popup-docker:hover {\n    background-color: #999;\n    color: white;\n}\n\n.ol-popup .ol-popup-content > *:first-child {\n    margin-right: 40px;\n}\n\n.ol-popup .arrow.active:hover {\n    background-color: #999;\n    color: white;    \n}\n\n";
    var html = "\n<div class=\"map\"></div>\n<div class='dock-container'></div>\n";
    var sample_content = [
        "The story of the three little pigs...",
        "This little piggy went to market",
        "This little piggy stayed home",
        "This little piggy had roast beef",
        "This little piggy had none",
        "And this little piggy, <br/>this wee little piggy, <br/>when wee, wee, wee, wee <br/>all the way home!"
    ];
    exports.center = ol.proj.transform([-85, 15], "EPSG:4326", "EPSG:3857");
    function run() {
        document.head.appendChild(index_2.html("<style name=\"paging\" type='text/css'>" + css + "</style>"));
        document.body.appendChild(index_2.html("<div>" + html + "</div>"));
        var mapContainer = document.getElementsByClassName("map")[0];
        var dockContainer = document.getElementsByClassName("dock-container")[0];
        var map = map_maker_1.MapMaker(mapContainer);
        map.getView().animate({ center: exports.center, zoom: 12 });
        var popup = ol3_popup_4.Popup.create({
            map: map,
            autoPan: true,
            autoPanMargin: 20,
            autoPanAnimation: {
                source: null,
                duration: 50
            },
            autoPopup: true,
            showCoordinates: true,
            css: css_popup,
            dockContainer: dockContainer
        });
        popup.on("show", function () { return console.log("show popup"); });
        popup.on("hide", function () { return console.log("hide popup"); });
        popup.pages.on("goto", function () { return console.log("goto page: " + popup.pages.activeIndex); });
        {
            var points_1 = circle(10000, 15).map(function (n) { return new ol.geom.Point([exports.center[0] + n[0], exports.center[1] + n[1]]); });
            var page6Promise_1 = $.Deferred();
            var d2_1 = $.Deferred();
            var page6div_1 = document.createElement("div");
            page6div_1.innerHTML = "<p>Page 6: This function promise resolves to a div element</p>";
            var div2_1 = index_2.html("<div>P</div>");
            setInterval(function () { return (div2_1.innerHTML = new Date().toTimeString()); }, 1000);
            slowloop_2.slowloop([
                function () {
                    FeatureCreator.create({
                        map: map
                    });
                    popup.show(exports.center, "<div>Click the map to see a popup</div>");
                },
                function () { return popup.dock(); },
                function () { return popup.undock(); },
                function () { return popup.pages.add(div2_1, points_1[popup.pages.count]); },
                function () {
                    var count = 0;
                    popup.pages.add(function () { return "<p>Page 2: This string function has been called " + ++count + " times</p>"; }, points_1[popup.pages.count]);
                },
                function () { return popup.pages.goto(0); },
                function () { return [3, 4, 5].map(function (i) { return popup.pages.add("Page " + i + ": Basic string pages", points_1[popup.pages.count]); }); },
                function () { return popup.pages.next(); },
                function () { return popup.pages.next(); },
                function () { return popup.pages.next(); },
                function () { return popup.pages.add(page6Promise_1, points_1[popup.pages.count]); },
                function () { return popup.pages.next(); },
                function () { return page6Promise_1.resolve("<p>Page 6: This promise resolves to a string<p>"); },
                function () { return popup.pages.add(d2_1, points_1[popup.pages.count]); },
                function () { return popup.pages.next(); },
                function () { return d2_1.resolve(page6div_1); },
                function () {
                    var count = 0;
                    popup.pages.add(function () {
                        var div = document.createElement("div");
                        div.innerHTML = "<p>Page 8: This dom function has been called " + ++count + " times</p>";
                        return div;
                    }, points_1[popup.pages.count]);
                },
                function () { return popup.pages.next(); },
                function () { return sample_content.map(function (m) { return popup.pages.add(m, points_1[popup.pages.count]); }); },
                function () { return popup.pages.goto(popup.pages.count - 1); }
            ], 200).then(function () {
                return slowloop_2.slowloop(index_2.range(popup.pages.count)
                    .reverse()
                    .map(function (n) { return function () { return popup.pages.goto(n); }; }), 200, 2);
            });
        }
    }
    exports.run = run;
});
define("examples/style-offset", ["require", "exports", "openlayers", "ol3-popup/ol3-popup", "node_modules/ol3-symbolizer/index", "node_modules/ol3-fun/ol3-fun/common", "examples/extras/feature-creator"], function (require, exports, ol, ol3_popup_5, Symbolizer, common_9, FeatureCreator) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var symbolizer = new Symbolizer.Symbolizer.StyleConverter();
    function setStyle(feature, json) {
        var style = symbolizer.fromJson(json);
        feature.getGeometry().set("popup-info", json.popup);
        feature.setStyle(style);
        return style;
    }
    var css = "\nhead, body {\n    background-color: black;\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.map {\n    opacity: 0.8;\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n";
    var html = "\n<div class=\"map\">\n<label>\nI think the idea here was to place popup data directly on the geometry so, for example, the triangle will have center-center popup, the circle bottom-center and the star top-center\nbut it is not complete.  I'm not sure what the geom is returned from paging...defer until after paging tests are complete.\n</label>\n</div>\n";
    var center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');
    function run() {
        document.head.appendChild(common_9.html("<style name=\"style-offset\" type='text/css'>" + css + "</style>"));
        document.body.appendChild(common_9.html("<div>" + html + "</div>"));
        var mapContainer = document.getElementsByClassName("map")[0];
        var map = new ol.Map({
            target: mapContainer,
            layers: [],
            view: new ol.View({
                center: center,
                zoom: 16
            })
        });
        var popup = ol3_popup_5.Popup.create({
            map: map,
            autoPan: true,
            autoPanMargin: 20,
            autoPanAnimation: {
                source: null,
                duration: 500
            },
            pointerPosition: 20,
            positioning: "top-left",
            offset: [0, -10],
            css: "\n        .ol-popup {\n            background-color: white;\n            border: 1px solid black;\n            padding: 4px;\n            width: 200px;\n        }\n        "
        });
        var vectorSource = new ol.source.Vector({
            features: []
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: function (f, res) { return f.getStyle(); }
        });
        map.addLayer(vectorLayer);
        FeatureCreator
            .create({ map: map })
            .addSomeFeatures(vectorLayer, center);
        popup.on("show", function () {
            popup.applyOffset(popup.options.offset || [0, 0]);
        });
        popup.pages.on("goto", function () {
            var geom = popup.pages.activePage.location;
            var popupInfo = geom.get("popup-info");
            if (popupInfo) {
                if (popupInfo.positioning) {
                    var p_1 = popup.getPositioning();
                    if (p_1 !== popupInfo.positioning) {
                        popup.setPositioning(popupInfo.positioning);
                        var h_2 = popup.on("hide", function () {
                            ol.Observable.unByKey(h_2);
                            popup.setPositioning(p_1);
                        });
                    }
                }
                if (popupInfo.offset) {
                    popup.applyOffset(popupInfo.offset);
                }
            }
            else {
                popup.setOffset(popup.options.offset || [0, 0]);
            }
        });
    }
    exports.run = run;
});
define("examples/simple", ["require", "exports", "openlayers", "node_modules/ol3-fun/ol3-fun/common", "ol3-popup/ol3-popup", "examples/extras/feature-creator"], function (require, exports, ol, common_10, ol3_popup_6, FeatureCreator) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var css = "\nhead, body, .map {\n    padding: 0;\n    margin: 0;\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\nbody { \n    margin-top: 0;\n    margin-left: 1px;\n}\n\nbody * {\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n";
    var html = "\n<div class=\"map\"></div>\n";
    var center = ol.proj.transform([-85, 35], 'EPSG:4326', 'EPSG:3857');
    function run() {
        console.log("the purpose of this example is to show the techniques and complexities of creating a popup control");
        common_10.cssin("simple", css);
        document.body.appendChild(common_10.html("<div>" + html + "</div>"));
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        var map = new ol.Map({
            target: document.getElementsByClassName("map")[0],
            layers: [vectorLayer],
            view: new ol.View({
                projection: "EPSG:3857",
                center: center,
                zoom: 16
            })
        });
        FeatureCreator
            .create({ map: map })
            .addSomeFeatures(vectorLayer, center);
        map.addOverlay(new ol.Overlay({
            position: center,
            positioning: "center-center",
            element: common_10.html("<div border=\"1px solid red\">\u274C</div>"),
        }));
        var popup = ol3_popup_6.Popup.create({
            map: map,
            pointerPosition: 5,
            autoPan: true,
            showCoordinates: true,
            autoPanMargin: 20,
            positioning: "bottom-center",
            autoPanAnimation: {
                source: null,
                duration: 20
            }
        });
        map.once('postrender', function () {
            var d = new Promise(function (resolve) {
                popup.options.autoPositioning = false;
                var original = popup.getPositioning();
                var items = common_10.pair("top,center,bottom".split(","), "left,center,right".split(","));
                var h = setInterval(function () {
                    var positioning;
                    if (!items.length) {
                        clearInterval(h);
                        popup.options.autoPositioning = true;
                        positioning = original;
                        resolve();
                    }
                    else {
                        positioning = items.pop().join("-");
                    }
                    popup.setPositioning(positioning);
                    popup.show(center, positioning);
                }, 200);
            });
            d.then(function () {
                map.getView().setZoom(map.getView().getZoom() + 1);
                var size = map.getSize();
                var count = 5;
                var _a = size.map(function (sz) { return common_10.range(count).map(function (n) { return sz * n / (count - 1); }); }), dx = _a[0], dy = _a[1];
                var coords = common_10.pair(dx, dy).map(function (p) { return map.getCoordinateFromPixel(p); });
                var h = setInterval(function () {
                    if (!coords.length) {
                        clearInterval(h);
                        return;
                    }
                    var c = coords.pop();
                    popup.show(c, c.map(function (n) { return Math.floor(n); }) + "<br/>" + coords.length + " remaining");
                }, 200);
            });
        });
    }
    exports.run = run;
});
define("examples/index", ["require", "exports", "node_modules/ol3-fun/index", "examples/activate", "examples/docking", "examples/multi", "examples/overlay", "examples/paging", "examples/style-offset", "examples/simple"], function (require, exports, index_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=examples/";
        var labs = "\n    activate\n    docking\n    multi    \n    overlay\n    paging\n    simple\n    index\n    ";
        var markup = labs
            .split(/ /)
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return !!v; })
            .sort()
            .map(function (lab) { return "<a href=\"" + path + lab + "&debug=1\">" + lab + "</a>"; })
            .join("<br/>");
        document.body.appendChild(index_3.html("<div>" + markup + "</div>"));
    }
    exports.run = run;
});
//# sourceMappingURL=examples.max.js.map