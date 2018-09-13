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
define("node_modules/ol3-fun/tests/base", ["require", "exports", "node_modules/ol3-fun/ol3-fun/slowloop"], function (require, exports, slowloop_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.slowloop = slowloop_1.slowloop;
    function describe(title, fn) {
        console.log(title || "undocumented test group");
        return window.describe(title, fn);
    }
    exports.describe = describe;
    function it(title, fn) {
        console.log(title || "undocumented test");
        return window.it(title, fn);
    }
    exports.it = it;
    function should(result, message) {
        console.log(message || "undocumented assertion");
        if (!result)
            throw message;
    }
    exports.should = should;
    function shouldEqual(a, b, message) {
        if (a != b)
            console.warn("\"" + a + "\" <> \"" + b + "\"");
        should(a == b, message);
    }
    exports.shouldEqual = shouldEqual;
    function stringify(o) {
        return JSON.stringify(o, null, "\t");
    }
    exports.stringify = stringify;
});
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
define("node_modules/ol3-fun/index", ["require", "exports", "node_modules/ol3-fun/ol3-fun/common", "node_modules/ol3-fun/ol3-fun/navigation", "node_modules/ol3-fun/ol3-fun/parse-dms", "node_modules/ol3-fun/ol3-fun/slowloop"], function (require, exports, common_2, navigation_1, parse_dms_1, slowloop_2) {
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
        slowloop: slowloop_2.slowloop,
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
define("index", ["require", "exports", "ol3-popup/ol3-popup"], function (require, exports, ol3_popup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Popup = ol3_popup_1.Popup;
    exports.DEFAULT_OPTIONS = ol3_popup_1.DEFAULT_OPTIONS;
    exports.DIAMONDS = ol3_popup_1.DIAMONDS;
    exports.TRIANGLES = ol3_popup_1.TRIANGLES;
});
define("examples/extras/once", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function once(map, event, cb) {
        var d = $.Deferred();
        map.once(event, function () {
            try {
                $.when(cb())
                    .then(function (result) { return d.resolve(result); })
                    .catch(function (ex) { return d.reject(ex); });
            }
            catch (ex) {
                d.reject(ex);
            }
        });
        return d;
    }
    exports.once = once;
});
define("tests/extras/kill", ["require", "exports", "node_modules/ol3-fun/tests/base"], function (require, exports, base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function kill(popup, delay) {
        if (delay === void 0) { delay = 1000; }
        var cancel = false;
        popup.getMap().once("pointermove", function () {
            cancel = true;
        });
        return function () {
            return base_1.slowloop([
                function () {
                    if (cancel)
                        throw "cancelled by user via pointermove";
                    popup.getMap().getTarget().remove();
                    popup.getMap().setTarget(null);
                    popup.destroy();
                }
            ], delay);
        };
    }
    exports.kill = kill;
});
define("tests/spec/popup", ["require", "exports", "openlayers", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/index", "index", "examples/extras/once", "tests/extras/kill"], function (require, exports, ol, base_2, index_1, index_2, once_1, kill_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createMapDiv() {
        var div = document.createElement("div");
        div.className = "map";
        document.body.appendChild(div);
        return div;
    }
    base_2.describe("spec/popup", function () {
        base_2.it("Popup", function () {
            base_2.should(!!index_2.Popup, "Popup");
        });
        base_2.it("DEFAULT_OPTIONS", function () {
            checkDefaultInputOptions(index_2.DEFAULT_OPTIONS);
            base_2.should(!index_2.DEFAULT_OPTIONS.pagingStyle, "pagingStyle");
            var p1 = index_2.Popup.create({ autoPopup: false });
            p1.options.autoPopup = true;
            checkDefaultInputOptions(p1.options);
            base_2.should(!!p1.options.pagingStyle, "pagingStyle");
        });
        base_2.it("Ensures options do not leak into other instances", function () {
            var p1 = index_2.Popup.create({ autoPopup: false });
            var p2 = index_2.Popup.create({ autoPopup: false });
            var expected = p1.options.indicatorOffsets["top-center"][0];
            p1.options.indicatorOffsets["top-center"][0] += 200;
            var actual = p2.options.indicatorOffsets["top-center"][0];
            base_2.shouldEqual(actual, expected, "default did not change");
            p1.destroy();
            p2.destroy();
        });
        base_2.it("Ensures global options can be tweaked", function () {
            var originalDefaultValue = index_2.DEFAULT_OPTIONS.indicatorOffsets["top-center"][0];
            var expected = (index_2.DEFAULT_OPTIONS.indicatorOffsets["top-center"][0] += 200);
            try {
                var p1 = index_2.Popup.create({ autoPopup: false });
                var actual = p1.options.indicatorOffsets["top-center"][0];
                base_2.shouldEqual(actual, expected, "default did change");
                p1.destroy();
            }
            finally {
                index_2.DEFAULT_OPTIONS.indicatorOffsets["top-center"][0] = originalDefaultValue;
            }
        });
        base_2.it("Constructors", function () {
            var map = new ol.Map({});
            try {
                index_2.Popup.create({ id: "constructor-test" }).destroy();
            }
            catch (_a) {
                base_2.should(true, "empty constructor throws, either map or autoPopup=false necessary");
            }
            index_2.Popup.create({ autoPopup: false }).destroy();
            index_2.Popup.create({ map: map }).destroy();
            map.setTarget(null);
        });
        base_2.it("Paging", function () {
            var target = createMapDiv();
            var map = new ol.Map({
                target: target,
                layers: [],
                view: new ol.View({
                    center: [0, 0],
                    projection: "EPSG:3857",
                    zoom: 24
                })
            });
            var popup = index_2.Popup.create({ id: "paging-test", map: map });
            return once_1.once(map, "postrender", function () {
                var c = map.getView().getCenter();
                var points = index_1.pair(index_1.range(3), index_1.range(3)).map(function (n) { return new ol.geom.Point([c[0] + n[0], c[1] + n[1]]); });
                var count = 0;
                points.forEach(function (p, i) {
                    popup.pages.add(function () { return "Page " + (i + 1) + ": visit counter: " + ++count; }, p);
                    base_2.shouldEqual(popup.pages.count, i + 1, i + 1 + " pages");
                });
                var i = 0;
                return base_2.slowloop([function () { return popup.pages.goto(i++); }], 100, popup.pages.count).then(function () {
                    base_2.shouldEqual(popup.getElement().getElementsByClassName("ol-popup-content")[0].textContent, "Page 9: visit counter: 9", "last page contains correct text");
                });
            }).then(kill_1.kill(popup));
        });
    });
    function checkDefaultInputOptions(options) {
        base_2.should(!!options, "options");
        base_2.shouldEqual(typeof options.asContent, "function", "asContent");
        base_2.shouldEqual(options.autoPan, true, "autoPan");
        base_2.shouldEqual(!options.autoPanAnimation, true, "autoPanAnimation");
        base_2.shouldEqual(options.autoPanMargin, 20, "autoPanMargin");
        base_2.shouldEqual(options.autoPopup, true, "autoPopup");
        base_2.shouldEqual(options.autoPositioning, true, "autoPositioning");
        base_2.shouldEqual(options.className, "ol-popup", "className");
        base_2.shouldEqual(typeof options.css, "string", "css");
        base_2.shouldEqual(!options.dockContainer, true, "dockContainer");
        base_2.shouldEqual(!options.element, true, "element");
        base_2.shouldEqual(!!options.id, true, "id");
        base_2.shouldEqual(options.insertFirst, true, "insertFirst");
        base_2.shouldEqual(!options.layers, true, "layers");
        base_2.shouldEqual(!options.map, true, "map");
        base_2.shouldEqual(!options.multi, true, "multi");
        base_2.shouldEqual(base_2.stringify(options.offset), base_2.stringify([0, -10]), "offset");
        base_2.shouldEqual(options.pointerPosition, 20, "pointerPosition");
        base_2.shouldEqual(!options.position, true, "position");
        base_2.shouldEqual(options.positioning, "bottom-center", "positioning");
        base_2.shouldEqual(!options.showCoordinates, true, "showCoordinates");
        base_2.shouldEqual(options.stopEvent, true, "stopEvent");
    }
});
define("tests/spec/popup-content", ["require", "exports", "openlayers", "node_modules/ol3-fun/tests/base", "index"], function (require, exports, ol, base_3, index_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_3.describe("spec/popup-content", function () {
        base_3.it("asContent returns a DOM node with content", function () {
            var popup = index_3.Popup.create({ autoPopup: false });
            var feature = new ol.Feature({ name: "Feature Name" });
            var html = popup.options.asContent(feature);
            base_3.should(0 < html.outerHTML.indexOf("Feature Name"), "Feature Name");
            base_3.shouldEqual("<table><tbody><tr><td>name</td><td>Feature Name</td></tr></tbody></table>", html.innerHTML, "popup markup");
        });
    });
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
define("tests/spec/popup-css", ["require", "exports", "openlayers", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/ol3-fun/common", "index", "examples/extras/map-maker", "examples/extras/once", "tests/extras/kill"], function (require, exports, ol, base_4, common_5, index_4, map_maker_1, once_2, kill_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createMapDiv() {
        var div = document.createElement("div");
        div.className = "map";
        document.body.appendChild(div);
        return div;
    }
    function rect(extent) {
        var x1 = extent[0], y1 = extent[1], x2 = extent[2], y2 = extent[3];
        return [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
    }
    function callout(points, options) {
        var index = options.index, size = options.size, width = options.width, offset = options.offset, skew = options.skew;
        var a = points[index];
        var c = points[index + 1];
        var isVertical = a[0] === c[0];
        var isHorizontal = a[1] === c[1];
        var isLeft = isVertical && a[1] > c[1];
        var isRight = isVertical && a[1] < c[1];
        var isTop = isHorizontal && a[0] < c[0];
        var isBottom = isHorizontal && a[0] > c[0];
        var b = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
        if (isHorizontal) {
            b[0] += offset;
        }
        if (isVertical) {
            b[1] += offset;
        }
        var b0 = [b[0], b[1]];
        var b1 = [b[0], b[1]];
        if (isHorizontal) {
            if (isTop) {
                b[0] += skew;
                b[1] -= size;
                b0[0] -= width / 2;
                b1[0] += width / 2;
            }
            if (isBottom) {
                b[0] += skew;
                b[1] += size;
                b0[0] += width / 2;
                b1[0] -= width / 2;
            }
        }
        if (isVertical) {
            if (isLeft) {
                b[1] += skew;
                b[0] -= size;
                b0[1] += width / 2;
                b1[1] -= width / 2;
            }
            if (isRight) {
                b[1] += skew;
                b[0] += size;
                b0[1] -= width / 2;
                b1[1] += width / 2;
            }
        }
        points.splice(index + 1, 0, b0, b, b1);
        return points;
    }
    base_4.describe("ol3-popup/popup-css", function () {
        base_4.it("Ensures css is destroyed with popup", function () {
            var popup = index_4.Popup.create({
                id: "my-popup",
                autoPopup: false
            });
            var styleNode = document.getElementById("style-my-popup_options");
            base_4.should(!!styleNode, "css node exists");
            popup.destroy();
            styleNode = document.getElementById("style-my-popup_options");
            base_4.should(!styleNode, "css node does not exist");
        });
        base_4.it("DIAMONDS", function () {
            var div = createMapDiv();
            var map = map_maker_1.MapMaker(div);
            var popup = index_4.Popup.create({
                id: "diamonds-test",
                map: map,
                indicators: index_4.DIAMONDS,
                indicatorOffsets: {
                    "bottom-left": [15, 16],
                    "bottom-center": [0, 16],
                    "bottom-right": [15, 16],
                    "center-left": [10, 0],
                    "center-center": [0, 0],
                    "center-right": [9, 0],
                    "top-left": [15, 19],
                    "top-center": [0, 19],
                    "top-right": [15, 19]
                },
                pointerPosition: 1,
                positioning: "bottom-center",
                autoPositioning: false,
                css: index_4.DEFAULT_OPTIONS.css +
                    "\n\t\t\t\t.ol-popup {\n\t\t\t\t\tbackground: silver;\n\t\t\t\t\tcolor: black;\n\t\t\t\t\tborder-radius: 1em;\n\t\t\t\t\tpadding: 1em;\n\t\t\t\t\tborder-color: silver;\n\t\t\t\t}\n\t\t\t\t.ol-popup.top.right {\n\t\t\t\t\tborder-top-right-radius: 0em;\n\t\t\t\t}\t\n\t\t\t\t.ol-popup.top.left {\n\t\t\t\t\tborder-top-left-radius: 0em;\n\t\t\t\t}\t\n\t\t\t\t.ol-popup.bottom.right {\n\t\t\t\t\tborder-bottom-right-radius: 0em;\n\t\t\t\t}\t\n\t\t\t\t.ol-popup.bottom.left {\n\t\t\t\t\tborder-bottom-left-radius: 0em;\n\t\t\t\t}\t\n\t\t\t\t.ol-popup.center.left {\n\t\t\t\t\tborder-top-left-radius: 0em;\n\t\t\t\t\tborder-bottom-left-radius: 0em;\n\t\t\t\t}\t\n\t\t\t\t.ol-popup.center.right {\n\t\t\t\t\tborder-top-right-radius: 0em;\n\t\t\t\t\tborder-bottom-right-radius: 0em;\n\t\t\t\t}\t\n\t\t\t\t.popup-indicator { \n\t\t\t\tcolor: silver;\n\t\t\t\tfont-weight: 900;\n\t\t\t}\n"
            });
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({ features: [new ol.Feature(new ol.geom.Point(map.getView().getCenter()))] })
            });
            map.addLayer(vectorLayer);
            return once_2.once(map, "postrender", function () {
                return base_4.slowloop(Object.keys(popup.options.indicators).map(function (k) { return function () {
                    popup.setPositioning(k);
                    popup.show(map.getView().getCenter(), "Popup with " + k);
                    base_4.shouldEqual(popup.indicator.getElement().textContent, popup.options.indicators[k], k);
                }; }), 200)
                    .then(kill_2.kill(popup))
                    .catch(function (ex) {
                    base_4.should(!ex, ex);
                });
            });
        });
        base_4.it("renders a tooltip on a canvas", function () {
            var div = document.createElement("div");
            div.className = "canvas-container";
            var cssRemove = common_5.cssin("canvas-test", ".canvas-container {\n            display: inline-block;\n            position: absolute;\n            top: 20px;\n            width: 200px;\n\t\t\theight: 200px;\n\t\t\tbackground: blue;\n            border: 1px solid white;\n        }");
            div.innerHTML = "DIV CONTENT";
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = 200;
            canvas.style.position = "absolute";
            canvas.style.top = canvas.style.left = canvas.style.right = canvas.style.bottom = "0";
            div.appendChild(canvas);
            document.body.insertBefore(div, document.body.firstChild);
            var ctx = canvas.getContext("2d");
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            var clear = function () { return ctx.clearRect(0, 0, canvas.width, canvas.height); };
            var loop = [
                function () {
                    var points = rect([10, 10, 190, 190]);
                    clear();
                    ctx.beginPath();
                    ctx.moveTo(points[0][0], points[0][1]);
                    points.forEach(function (p) { return ctx.lineTo(p[0], p[1]); });
                    ctx.closePath();
                    ctx.stroke();
                }
            ];
            {
                var points = common_5.range(4).map(function (index) {
                    return callout(rect([25, 25, 175, 175]), { index: index, size: 25, width: 25, skew: 10, offset: 20 });
                });
                loop = loop.concat(points.map(function (points) { return function () {
                    clear();
                    ctx.beginPath();
                    ctx.moveTo(points[0][0], points[0][1]);
                    points.forEach(function (p) { return ctx.lineTo(p[0], p[1]); });
                    ctx.closePath();
                    ctx.stroke();
                }; }));
            }
            return $.when(base_4.slowloop(common_5.range(100).map(function (n) { return function () {
                div.style.left = div.style.top = 10 * Math.sin((n * Math.PI) / 100) * n + "px";
            }; }), 50), base_4.slowloop(loop, 200).then(function () {
                loop = [];
                var points = common_5.range(70).map(function (index) {
                    return callout(rect([20, 20, 180, 180]), {
                        index: 0,
                        size: 10,
                        width: 20,
                        skew: 0,
                        offset: 2 * index - 70
                    });
                });
                points = points.concat(common_5.range(140).map(function (index) {
                    return callout(rect([20, 20, 180, 180]), {
                        index: 1,
                        size: 10,
                        width: 20,
                        skew: 0,
                        offset: index - 70
                    });
                }));
                points = points.concat(common_5.range(140)
                    .reverse()
                    .map(function (index) {
                    return callout(rect([20, 20, 180, 180]), {
                        index: 2,
                        size: 10,
                        width: 20,
                        skew: 0,
                        offset: index - 70
                    });
                }));
                points = points.concat(common_5.range(140)
                    .reverse()
                    .map(function (index) {
                    return callout(rect([20, 20, 180, 180]), {
                        index: 3,
                        size: 10,
                        width: 20,
                        skew: 0,
                        offset: index - 70
                    });
                }));
                loop = loop.concat(points.map(function (points) { return function () {
                    clear();
                    ctx.beginPath();
                    ctx.moveTo(points[0][0], points[0][1]);
                    points.forEach(function (p) { return ctx.lineTo(p[0], p[1]); });
                    ctx.closePath();
                    ctx.stroke();
                }; }));
                return base_4.slowloop(loop, 0).then(function () { return base_4.slowloop(loop.reverse(), 0).then(function () { return div.remove(); }); });
            })).then(function () { return cssRemove(); });
        }).timeout(6000);
    });
});
define("tests/spec/smartpick", ["require", "exports", "openlayers", "node_modules/ol3-fun/tests/base", "ol3-popup/commands/smartpick", "examples/extras/map-maker", "index", "examples/extras/once", "tests/extras/kill"], function (require, exports, ol, base_5, smartpick_2, map_maker_2, index_5, once_3, kill_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function PopupMaker(map) {
        var popup = index_5.Popup.create({
            id: "spec-smartpicker-test",
            map: map,
            autoPanAnimation: {
                duration: 200,
                source: [0, 0]
            },
            css: "\n\t\t\t\t.ol-popup-element { color: rgb(200, 200, 200) }\n                .ol-popup-element .pagination { margin-bottom: 2px }\n                .ol-popup-element button.arrow  { background: transparent; border: none; color: rgb(200, 200, 200); }\n                .ol-popup-content { color: rgb(200, 200, 200); max-width: 8em; max-height: 4em; margin: 0.5em; padding: 0.5em; overflow: hidden; overflow-y: auto} \n\t\t\t\t.ol-popup { background-color: rgb(30, 30, 30); border: 2px solid rgb(200, 200, 200); } \n\t\t\t\t.ol-popup:before {\n\t\t\t\t\tcontent: \" \";\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\ttop: -2px;\n\t\t\t\t\tleft: -2px;\n\t\t\t\t\tright: -2px;\n\t\t\t\t\tbottom: -2px;\n\t\t\t\t\tborder: 1px solid rgb(30, 30, 30);\n\t\t\t\t}\n                .ol-popup-element .ol-popup-closer { right: 4px }"
        });
        return popup;
    }
    function createMapDiv() {
        var div = document.createElement("div");
        div.className = "map";
        document.body.appendChild(div);
        return div;
    }
    function GridMapMaker() {
        var _a = [20000, 20000], w = _a[0], h = _a[1];
        var points = GridMaker(w, h);
        var div = createMapDiv();
        var map = map_maker_2.MapMaker(div);
        map.getView().setCenter([0, 0]);
        var rez = map.getView().getResolutionForExtent([-w, -h, w, h]);
        map.getView().setResolution(rez);
        var vectors = VectorMaker();
        map.addLayer(vectors);
        vectors.getSource().addFeatures(points.map(function (p) {
            var geom = new ol.geom.Point(p);
            var ll = ol.proj.toLonLat(p);
            return new ol.Feature({
                geometry: geom,
                latlon: ll[1].toPrecision(5) + " " + ll[0].toPrecision(5)
            });
        }));
        return { map: map, points: points, div: div };
    }
    function GridMaker(w, h) {
        return [[-w, h], [0, h], [w, h], [w, 0], [w, -h], [0, -h], [-w, -h], [-w, 0], [0, 0]];
    }
    function VectorMaker() {
        var vectorSource = new ol.source.Vector({
            features: []
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(255, 255, 255, 0.2)"
                }),
                stroke: new ol.style.Stroke({
                    color: "#ffcc33",
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: "#ffcc33"
                    })
                })
            })
        });
        return vectorLayer;
    }
    base_5.describe("smartpick", function () {
        base_5.it("places 9 popups on the map", function () {
            var _a = GridMapMaker(), map = _a.map, points = _a.points, div = _a.div;
            div.style.width = div.style.height = "480px";
            div.style.border = "1px solid white";
            map.setTarget(null);
            map.setTarget(div);
            var popups = points.map(function () {
                var popup = PopupMaker(map);
                popup.options.autoPopup = false;
                popup.options.pointerPosition = 0;
                popup.options.indicatorOffsets["top-right"][1] -= 0;
                popup.options.indicatorOffsets["top-center"][1] -= 1;
                popup.options.indicatorOffsets["top-left"][1] -= 0;
                popup.options.indicatorOffsets["center-left"][0] += 3;
                popup.options.indicatorOffsets["center-right"][0] += 3;
                popup.options.indicatorOffsets["bottom-left"][1] += 1;
                popup.options.indicatorOffsets["bottom-center"][1] += 1;
                popup.options.indicatorOffsets["bottom-right"][1] += 1;
                return popup;
            });
            return once_3.once(map, "postrender", function () {
                return base_5.slowloop(points.map(function (p, i) { return function () {
                    var popup = popups[i];
                    popup.show(p, smartpick_2.smartpick(popup, p));
                }; }), 0);
            })
                .then(kill_3.kill(popups[0]))
                .then(function () { return popups.map(function (p) { return p.destroy(); }); });
        });
        base_5.it("configures a map with popup and points in strategic locations to ensure the positioning is correct", function () {
            var _a = GridMapMaker(), map = _a.map, points = _a.points;
            return once_3.once(map, "postrender", function () {
                var popup = PopupMaker(map);
                return base_5.slowloop(points.map(function (p) { return function () {
                    var expected = smartpick_2.smartpick(popup, p);
                    popup.show(p, "" + expected);
                    var actual = popup.getPositioning();
                    base_5.shouldEqual(expected, actual, "positioning");
                }; }), 400, 1).then(kill_3.kill(popup, 0));
            });
        });
    });
});
define("tests/index", ["require", "exports", "tests/spec/popup", "tests/spec/popup-content", "tests/spec/popup-css", "tests/spec/smartpick"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("node_modules/ol3-fun/tests/spec/api", ["require", "exports", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/index"], function (require, exports, base_6, API) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_6.describe("API", function () {
        base_6.it("full api exists", function () {
            base_6.shouldEqual([
                API.asArray,
                API.cssin,
                API.debounce,
                API.defaults,
                API.dms.parse,
                API.doif,
                API.getParameterByName,
                API.getQueryParameters,
                API.html,
                API.mixin,
                API.navigation.zoomToFeature,
                API.pair,
                API.parse,
                API.range,
                API.shuffle,
                API.slowloop,
                API.toggle,
                API.uuid,
            ].every(function (f) { return typeof f === "function"; }), true, "API functions exist");
        });
    });
});
define("node_modules/ol3-fun/tests/spec/common", ["require", "exports", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, base_7, common_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function sum(list) {
        return list.reduce(function (a, b) { return a + b; }, 0);
    }
    describe("asArray tests", function () {
        it("asArray", function (done) {
            if (!document)
                return;
            document.body.appendChild(document.createElement("div"));
            var list = document.getElementsByTagName("div");
            var result = common_6.asArray(list);
            base_7.should(result.length === list.length, "array size matches list size");
            done();
        });
    });
    describe("uuid tests", function () {
        it("uuid", function () {
            base_7.should(common_6.uuid().length === 36, "uuid has 36 characters");
        });
    });
    describe("pair tests", function () {
        it("empty test", function () {
            base_7.should(0 === common_6.pair([], []).length, "empty result");
            base_7.should(0 === common_6.pair([1], []).length, "empty result");
            base_7.should(0 === common_6.pair([], [1]).length, "empty result");
        });
        it("ensures all combinations", function () {
            var A = [1, 3, 5], B = [7, 11, 13], result = common_6.pair(A, B);
            base_7.should((A.length * sum(B) + B.length * sum(A)) === sum(result.map(function (v) { return v[0] + v[1]; })), "create product from two vectors");
        });
    });
    describe("range tests", function () {
        it("empty test", function () {
            base_7.should(0 === common_6.range(0).length, "empty result");
        });
        it("size tests", function () {
            base_7.should(1 === common_6.range(1).length, "single item");
            base_7.should(10 === common_6.range(10).length, "ten items");
        });
        it("content tests", function () {
            base_7.should(45 === sum(common_6.range(10)), "range '10' contains 0..9");
        });
    });
    describe("shuffle tests", function () {
        it("empty test", function () {
            base_7.should(0 === common_6.shuffle([]).length, "empty result");
        });
        it("size tests", function () {
            base_7.should(1 === common_6.shuffle(common_6.range(1)).length, "single item");
            base_7.should(10 === common_6.shuffle(common_6.range(10)).length, "ten items");
        });
        it("content tests", function () {
            base_7.should(45 === sum(common_6.shuffle(common_6.range(10))), "range '10' contains 0..9");
        });
    });
    describe("toggle tests", function () {
        it("toggle", function () {
            var div = document.createElement("div");
            base_7.should(div.className === "", "div contains no className");
            common_6.toggle(div, "foo");
            base_7.should(div.className === "foo", "toggle adds");
            common_6.toggle(div, "foo");
            base_7.should(div.className === "", "second toggles removes");
            common_6.toggle(div, "foo", true);
            base_7.should(div.className === "foo", "forces foo to exist when it does not exist");
            common_6.toggle(div, "foo", true);
            base_7.should(div.className === "foo", "forces foo to exist when it already exists");
            common_6.toggle(div, "foo", false);
            base_7.should(div.className === "", "forces foo to not exist");
            common_6.toggle(div, "foo", false);
            base_7.should(div.className === "", "forces foo to not exist");
        });
    });
    describe("parse tests", function () {
        it("parse", function () {
            var num = 0;
            var bool = false;
            base_7.should(common_6.parse("", "").toString() === "", "empty string");
            base_7.should(common_6.parse("1", "").toString() === "1", "numeric string");
            base_7.should(common_6.parse("1", num) === 1, "numeric string as number returns number");
            base_7.should(common_6.parse("0", bool) === false, "0 as boolean is false");
            base_7.should(common_6.parse("1", bool) === true, "1 as boolean is true");
            base_7.should(common_6.parse("false", bool) === false, "'false' as boolean is false");
            base_7.should(common_6.parse("true", bool) === true, "'true' as boolean is true");
            base_7.should(common_6.parse("1", num) === 1, "numeric string as number returns number");
            base_7.should(common_6.parse("1", num) === 1, "numeric string as number returns number");
            base_7.should(common_6.parse("1,2,3", [num])[1] === 2, "parse into numeric array");
        });
    });
    describe("getQueryParameters tests", function () {
        it("getQueryParameters", function () {
            var options = { a: "" };
            common_6.getQueryParameters(options, "foo?a=1&b=2");
            base_7.shouldEqual(options.a, "1", "a=1 extracted");
            base_7.shouldEqual(options.b, undefined, "b not assigned");
            options = { b: "" };
            common_6.getQueryParameters(options, "foo?a=1&b=2");
            base_7.shouldEqual(options.b, "2", "b=2 extracted");
            base_7.shouldEqual(options.a, undefined, "a not assigned");
            options.a = options.b = options.c = "<null>";
            common_6.getQueryParameters(options, "foo?a=1&b=2");
            base_7.shouldEqual(options.a, "1", "a=1 extracted");
            base_7.shouldEqual(options.b, "2", "b=2 extracted");
            base_7.shouldEqual(options.c, "<null>", "c not assigned, original value untouched");
        });
    });
    describe("getParameterByName tests", function () {
        it("getParameterByName", function () {
            base_7.shouldEqual(common_6.getParameterByName("a", "foo?a=1"), "1", "a=1");
            base_7.shouldEqual(common_6.getParameterByName("b", "foo?a=1"), null, "b does not exist");
        });
    });
    describe("doif tests", function () {
        var die = function (n) { throw "doif callback not expected to execute: " + n; };
        var spawn = function () {
            var v = true;
            return function () { return v = !v; };
        };
        it("doif false tests", function () {
            common_6.doif(undefined, die);
            common_6.doif(null, die);
        });
        it("doif empty tests", function () {
            var c = spawn();
            common_6.doif(0, c);
            base_7.shouldEqual(c(), true, "0 invokes doif");
            common_6.doif(false, c);
            base_7.shouldEqual(c(), true, "false invokes doif");
            common_6.doif({}, c);
            base_7.shouldEqual(c(), true, "{} invokes doif");
        });
        it("doif value tests", function () {
            common_6.doif(0, function (v) { return base_7.shouldEqual(v, 0, "0"); });
            common_6.doif({ a: 100 }, function (v) { return base_7.shouldEqual(v.a, 100, "a = 100"); });
        });
    });
    describe("mixin tests", function () {
        it("simple mixins", function () {
            base_7.shouldEqual(common_6.mixin({ a: 1 }, { b: 2 }).a, 1, "a=1");
            base_7.shouldEqual(common_6.mixin({ a: 1 }, { b: 2 }).b, 2, "b=2");
            base_7.shouldEqual(common_6.mixin({ a: 1 }, { b: 2 }).c, undefined, "c undefined");
            base_7.shouldEqual(common_6.mixin({ a: 1 }, {}).a, 1, "a=1");
            base_7.shouldEqual(common_6.mixin({}, { b: 2 }).b, 2, "b=2");
        });
        it("nested mixins", function () {
            var _a;
            base_7.shouldEqual(common_6.mixin({ vermont: { burlington: true } }, (_a = {}, _a["south carolina"] = { greenville: true }, _a))["south carolina"].greenville, true, "greenville is in south carolina");
            base_7.shouldEqual(common_6.mixin({ vermont: { burlington: true } }, { vermont: { greenville: false } }).vermont.greenville, false, "greenville is not in vermont");
            base_7.shouldEqual(common_6.mixin({ vermont: { burlington: true } }, { vermont: { greenville: false } }).vermont.burlington, undefined, "second vermont completely wipes out 1st");
        });
    });
    describe("defaults tests", function () {
        it("defaults", function () {
            base_7.shouldEqual(common_6.defaults({ a: 1 }, { a: 2, b: 3 }).a, 1, "a = 1");
            base_7.shouldEqual(common_6.defaults({ a: 1 }, { a: 2, b: 3 }).b, 3, "b = 3");
            base_7.shouldEqual(common_6.defaults({}, { a: 2, b: 3 }).a, 2, "a = 2");
        });
    });
    describe("cssin tests", function () {
        it("hides the body", function () {
            var handles = [];
            handles.push(common_6.cssin("css1", "body {display: none}"));
            handles.push(common_6.cssin("css1", "body {display: block}"));
            base_7.shouldEqual(getComputedStyle(document.body).display, "none", "body is hidden, 1st css1 wins");
            handles.shift()();
            base_7.shouldEqual(getComputedStyle(document.body).display, "none", "body is still hidden, 1st css1 still registered");
            handles.shift()();
            base_7.shouldEqual(getComputedStyle(document.body).display, "block", "body is no longer hidden, css1 destroyed");
        });
    });
    describe("html tests", function () {
        it("tableless tr test", function () {
            var markup = "<tr>A<td>B</td></tr>";
            var tr = common_6.html(markup);
            base_7.should(tr.nodeValue === "AB", "setting innerHTML on a 'div' will not assign tr elements");
        });
        it("table tr test", function () {
            var markup = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
            var table = common_6.html(markup);
            base_7.should(table.outerHTML === markup, "preserves tr when within a table");
        });
        it("canvas test", function () {
            var markup = "<canvas width=\"100\" height=\"100\"></canvas>";
            var canvas = common_6.html(markup);
            base_7.should(canvas.outerHTML === markup, "canvas markup preserved");
            base_7.should(!!canvas.getContext("2d"), "cnvas has 2d context");
        });
    });
});
define("node_modules/ol3-fun/tests/spec/slowloop", ["require", "exports", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, base_8, common_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_8.describe("slowloop", function () {
        base_8.it("slowloop empty", function (done) {
            try {
                base_8.slowloop(null);
                base_8.should(false, "slowloop requires an array");
            }
            catch (_a) {
                done();
            }
        });
        base_8.it("slowloop with progress", function () {
            var progressCount = 0;
            return base_8.slowloop(common_7.range(7).map(function (n) { return function () { }; }), 0, 5)
                .progress(function (args) {
                console.log(args);
                progressCount++;
            })
                .then(function () {
                base_8.shouldEqual(progressCount, 7 * 5, "progress callbacks");
            });
        });
        base_8.it("slowloop with exceptions", function () {
            return base_8.slowloop([
                function () {
                    throw "exception occured in slowloop";
                }
            ])
                .then(function () { return base_8.should(false, "failure expected"); })
                .catch(function (ex) { return base_8.should(!!ex, ex); });
        });
        base_8.it("slowloop with abort", function () {
            return base_8.slowloop([
                function () {
                    base_8.should(false, "aborted from inside");
                }
            ], 10)
                .reject("aborted from outside")
                .catch(function (ex) { return base_8.shouldEqual(ex, "aborted from outside", "aborted from outside"); });
        });
        base_8.it("slowloop fast", function (done) {
            var count = 0;
            var inc = function () { return count++; };
            base_8.slowloop([inc, inc, inc], 0, 100).then(function () {
                base_8.shouldEqual(count, 300, "0 ms * 100 iterations * 3 functions => 300 invocations");
                done();
            });
        }).timeout(2000);
        base_8.it("slowloop iterations", function (done) {
            var count = 0;
            var inc = function () { return count++; };
            base_8.slowloop([inc]).then(function () {
                base_8.shouldEqual(count, 1, "defaults to a single iteration");
                base_8.slowloop([inc], 0, 2).then(function () {
                    base_8.shouldEqual(count, 3, "performs two iterations");
                    base_8.slowloop([inc], 0, 0).then(function () {
                        base_8.shouldEqual(count, 3, "performs 0 iterations");
                        done();
                    });
                });
            });
        });
    });
});
define("node_modules/ol3-fun/tests/spec/openlayers-test", ["require", "exports", "node_modules/ol3-fun/tests/base", "openlayers"], function (require, exports, base_9, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("ol/Map", function () {
        it("ol/Map", function () {
            base_9.should(!!ol.Map, "Map");
        });
    });
});
define("node_modules/ol3-fun/tests/spec/parse-dms", ["require", "exports", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/ol3-fun/parse-dms"], function (require, exports, base_10, parse_dms_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_10.describe("parse-dms", function () {
        base_10.it("parse", function () {
            var dms = parse_dms_2.parse("10 5'2\" 10");
            if (typeof dms === "number")
                throw "lat-lon expected";
            base_10.should(dms.lat === 10.08388888888889, "10 degrees 5 minutes 2 seconds");
            base_10.should(dms.lon === 10, "10 degrees 0 minutes 0 seconds");
        });
    });
});
define("node_modules/ol3-fun/ol3-fun/google-polyline", ["require", "exports"], function (require, exports) {
    "use strict";
    var PolylineEncoder = (function () {
        function PolylineEncoder() {
        }
        PolylineEncoder.prototype.encodeCoordinate = function (coordinate, factor) {
            coordinate = Math.round(coordinate * factor);
            coordinate <<= 1;
            if (coordinate < 0) {
                coordinate = ~coordinate;
            }
            var output = '';
            while (coordinate >= 0x20) {
                output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 0x3f);
                coordinate >>= 5;
            }
            output += String.fromCharCode(coordinate + 0x3f);
            return output;
        };
        PolylineEncoder.prototype.decode = function (str, precision) {
            if (precision === void 0) { precision = 5; }
            var index = 0, lat = 0, lng = 0, coordinates = [], latitude_change, longitude_change, factor = Math.pow(10, precision);
            while (index < str.length) {
                var byte = 0;
                var shift = 0;
                var result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                var latitude_change_1 = ((result & 1) ? ~(result >> 1) : (result >> 1));
                shift = result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += latitude_change_1;
                lng += longitude_change;
                coordinates.push([lat / factor, lng / factor]);
            }
            return coordinates;
        };
        PolylineEncoder.prototype.encode = function (coordinates, precision) {
            if (precision === void 0) { precision = 5; }
            if (!coordinates.length)
                return '';
            var factor = Math.pow(10, precision), output = this.encodeCoordinate(coordinates[0][0], factor) + this.encodeCoordinate(coordinates[0][1], factor);
            for (var i = 1; i < coordinates.length; i++) {
                var a = coordinates[i], b = coordinates[i - 1];
                output += this.encodeCoordinate(a[0] - b[0], factor);
                output += this.encodeCoordinate(a[1] - b[1], factor);
            }
            return output;
        };
        return PolylineEncoder;
    }());
    return PolylineEncoder;
});
define("node_modules/ol3-fun/ol3-fun/ol3-polyline", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    var Polyline = ol.format.Polyline;
    var PolylineEncoder = (function () {
        function PolylineEncoder(precision, stride) {
            if (precision === void 0) { precision = 5; }
            if (stride === void 0) { stride = 2; }
            this.precision = precision;
            this.stride = stride;
        }
        PolylineEncoder.prototype.flatten = function (points) {
            var nums = new Array(points.length * this.stride);
            var i = 0;
            points.forEach(function (p) { return p.map(function (p) { return nums[i++] = p; }); });
            return nums;
        };
        PolylineEncoder.prototype.unflatten = function (nums) {
            var points = new Array(nums.length / this.stride);
            for (var i = 0; i < nums.length / this.stride; i++) {
                points[i] = nums.slice(i * this.stride, (i + 1) * this.stride);
            }
            return points;
        };
        PolylineEncoder.prototype.round = function (nums) {
            var factor = Math.pow(10, this.precision);
            return nums.map(function (n) { return Math.round(n * factor) / factor; });
        };
        PolylineEncoder.prototype.decode = function (str) {
            var nums = Polyline.decodeDeltas(str, this.stride, Math.pow(10, this.precision));
            return this.unflatten(this.round(nums));
        };
        PolylineEncoder.prototype.encode = function (points) {
            return Polyline.encodeDeltas(this.flatten(points), this.stride, Math.pow(10, this.precision));
        };
        return PolylineEncoder;
    }());
    return PolylineEncoder;
});
define("node_modules/ol3-fun/tests/spec/polyline", ["require", "exports", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/ol3-fun/google-polyline", "node_modules/ol3-fun/ol3-fun/ol3-polyline", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, base_11, GooglePolylineEncoder, PolylineEncoder, common_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("GooglePolylineEncoder", function () {
        it("GooglePolylineEncoder", function () {
            base_11.should(!!GooglePolylineEncoder, "GooglePolylineEncoder");
        });
        var points = common_8.pair(common_8.range(10), common_8.range(10));
        var poly = new GooglePolylineEncoder();
        var encoded = poly.encode(points);
        var decoded = poly.decode(encoded);
        base_11.shouldEqual(encoded.length, 533, "encoding is 533 characters");
        base_11.shouldEqual(base_11.stringify(decoded), base_11.stringify(points), "encode->decode");
    });
    describe("PolylineEncoder", function () {
        it("PolylineEncoder", function () {
            base_11.should(!!PolylineEncoder, "PolylineEncoder");
        });
        var points = common_8.pair(common_8.range(10), common_8.range(10));
        var poly = new PolylineEncoder();
        var encoded = poly.encode(points);
        var decoded = poly.decode(encoded);
        base_11.shouldEqual(encoded.length, 533, "encoding is 533 characters");
        base_11.shouldEqual(base_11.stringify(decoded), base_11.stringify(points), "encode->decode");
        poly = new PolylineEncoder(6);
        encoded = poly.encode(points);
        decoded = poly.decode(encoded);
        base_11.shouldEqual(encoded.length, 632, "encoding is 632 characters");
        base_11.shouldEqual(base_11.stringify(decoded), base_11.stringify(points), "encode->decode");
    });
});
define("node_modules/ol3-fun/ol3-fun/snapshot", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function getStyle(feature) {
        var style = feature.getStyle();
        if (!style) {
            var styleFn = feature.getStyleFunction();
            if (styleFn) {
                style = styleFn(0);
            }
        }
        if (!style) {
            style = new ol.style.Style({
                text: new ol.style.Text({
                    text: "?"
                })
            });
        }
        if (!Array.isArray(style))
            style = [style];
        return style;
    }
    var Snapshot = (function () {
        function Snapshot() {
        }
        Snapshot.render = function (canvas, feature) {
            feature = feature.clone();
            var geom = feature.getGeometry();
            var extent = geom.getExtent();
            var _a = ol.extent.getCenter(extent), cx = _a[0], cy = _a[1];
            var _b = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)], w = _b[0], h = _b[1];
            var isPoint = w === 0 || h === 0;
            var ff = 1 / (window.devicePixelRatio || 1);
            var scale = isPoint ? 1 : Math.min((ff * canvas.width) / w, (ff * canvas.height) / h);
            geom.translate(-cx, -cy);
            geom.scale(scale, -scale);
            geom.translate(Math.ceil((ff * canvas.width) / 2), Math.ceil((ff * canvas.height) / 2));
            console.log(scale, cx, cy, w, h, geom.getCoordinates());
            var vtx = ol.render.toContext(canvas.getContext("2d"));
            var styles = getStyle(feature);
            if (!Array.isArray(styles))
                styles = [styles];
            styles.forEach(function (style) { return vtx.drawFeature(feature, style); });
        };
        Snapshot.snapshot = function (feature, size) {
            if (size === void 0) { size = 128; }
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            this.render(canvas, feature);
            return canvas.toDataURL();
        };
        return Snapshot;
    }());
    return Snapshot;
});
define("node_modules/ol3-fun/tests/spec/snapshot", ["require", "exports", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/ol3-fun/snapshot", "openlayers", "node_modules/ol3-fun/ol3-fun/common"], function (require, exports, base_12, Snapshot, ol, common_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var pointData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFdUlEQVR4Xu1aXUybVRh+3hiWxiX+ZNSMECvjJxiqyaROyq5M2MWUZGyDLEZg0WzhJ2QELharjmbWGgqOOTRxTMDIGHpBpIwE40Un3ujA0EmUYkhcRpoJRObfJkJG9Ji3+1gWoP2+rudrSvq9l/2e857nPOc5/yUkeVCStx+GAIYDklwBYwgkuQGMSdAYAsYQSHIFjCGQ5AYwVgFjCBhDIMkViPsQEEKkANgFIB2AGcCjAP4AsADgOoBxIlqJV7/ETQAhRCWAlwA8D+DBCA38G8DXAD4jok/1FkJ3AYQQVgDdAAruozHfAqgloh/uo6ymIroKIIQ4DOBjAA9oYrMx6F8AVUTEeaSHLgIIITjvOwBel8jYTURNEvOFUuklQDMAh2yyAJqJ6A2ZeaULIIR4GUCfTJJrch0ion5Z+aUKIIRIA/CzyiwfK/d/AGQQES+bMYdsAc4D4OVO7/iEiF6VUYk0AYQQvMyNyiClMUc+EX2vERsWJlOAqHp/enoaY2NjmJubQ1paGgoKCpCbmxtNe3qI6JVoCmyElSKAsuz9CiBVC6GzZ8+ioaEBt2/fvgvfsmUL2tvbUVNToyUFYxaI6DGt4HA4WQLw3v47LWQ6OjpQW1sbFnru3DlUVVVpScWYZ4hoQitYTwfwjq9HjQjbPTMzE8vLy2GhJpMJS0tLaqlWvzuIqEUrWE8BGgC8p0ZkYGAApaWlajAIIVQxCuArIirSCtZTgDcBuNWInDp1CsePH1eDRSPA70S0TTVhBICsOYAH9YdqRLxeLw4ePKgGi0aAL4noBdWEcRCAW/W5GpHZ2VlkZWXJnAP4qNyhVm+k77IckKVsgVW58Cwfaanr7OzE0aNHVfMogGwiuqoVrNscwImFEDMAntBCpr+/H/X19Zifn78LT09Px5kzZ1BWVqYlBWOuE9HjWsHhcFIcoAjQCUBz162srGB0dBRXrlxBfn4+7HY7UlL4ulBzfERE1ZrRYYAyBXgOwFishKIov4uIxqPAbwiVJoDigosA9sVKSkP5QSI6oAGnCpEtwJMAflKtNTbAfwDyiGg6tjR3SksVQHEBX4XxlZhe8RoRtcpKLl0AJjY+Pt5jMpn4fICtW7ciIyMjIt+ZmZkQzmzmd5KI0U5EvO2WFnoIwHvddT3Ep8Dq6vWT9tDQEEpKSkINunbt2jqxFhYW4Ha7MTg4OB8MBrMBLEprvR5DAMD7gUDgWF5e3l2efO5vaWnB7t27UVRUhMnJSRARrFYr+vr6sH37drALcnJyYLFYQuUWFxdDYjQ3Nwuz2Uw3b96E0+l8GsBkwgvg9/uPDQ8PM+He1NTUhzweT0lhYSFaW1tx48YN8DcOm82GiooKNDY2btgmi8XyZzAYfMTv94fKOJ1OP4BnN5MAfE2Grq6uwyyA3W7/y+v1Pswu4JiamkJxcTF/DzmAY//+/di27c4B79KlS6Hfjxw5glu3bqGurg69vb1Sh63UZErPrBsCq+TZ4nwbdPr06W+6u7t/GxkZ2Xf58uWQ1VcF2Lt3L5qamrw7duw4UF5ezlvmoMvlsigO4MliaDM5YJXrFwBGXC7Xu9zjNputgj/4fL4Lq4BVAViMPXv2VFRWVl5wOBxwOBxXT548maUIsOnmgHsJP+VyuX5kB3g8nom2trZfAoFA8VoHqAjwNgDnZnLA2h477/P5Ku+dA6xW64TP59sZzgEnTpyYcLvdO7Ozs0MridPp5JtgKa9CLKQecwCfBfhMwLY/tGbd5p0Ov/AeU3rxA+Uxhd8SAwB4m8ui2QHUKa9Mbyn/KHkxTM6YDKGHADERindhQ4B4K55o9RkOSLQeiTcfwwHxVjzR6jMckGg9Em8+hgPirXii1Zf0DvgfGiXvUAsr6xQAAAAASUVORK5CYII=";
    var circleData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAHzUlEQVR4XuWbaWxVRRTHf+OGS1BRUQuCuICRRoMWFTRugEgCVo2IQqEgUAmpiCIgJuoHiAmgKEowBlsXwCLuEv2g0kaNti7RaBTFjaBScYtRq1FRueZ/79z75r32tfe9PmrpPclL+96dOzPnP+fMnG0MBSVvP2AUcIn9HFig7n8GNgBPAS+C+aNA/WIK05F3EFAJ3AAckr3Pb4Hv7ec74C9gJyDcDgeOsH+PbG1aPwLLgXvANLV3/u0EwDsMuA6YBbSw2l8EC8ZLwEYg7nyF5zBgJHABcFxLfP4CrACWgZGE5EV5AuB1A24HptvlcwbXyq4NFoiv8ppU85f6AtcCE62UpLX4HXgAmAdGIpUT5QGA1x94EjgpfaQvgaVAtRXtnOYRs7FwnwbcBByV+c4HwGVgPovZmd8sRwC8CcAq4ID0QaYCa4B/chm7HW33ttKghW8mDVPAPBG385gAeHsCd9uNzvYtZm8GlsQdaxe00/TnA7cBmmJEK4HZYP5ta9AYAHh7AOuBsanOGoFxQH1b/XfQ8zPtCalTJKJHgHIwOmayUhsA+MyvBspSPWg3vwL4qYOYiztMT6AGGJETCK0A0BLzDwHSdy/urDq4ndjRvjAlNghZAMjG/FUdzFC+wz0YG4RsAGhncXY3nXrS+VbVKd/Z7oL3pLmPBadiiuaDke2SRi0A4Mns+gjYJ2hZB1zYgUdcofDYy1qh54cd7gCKwXzujpABgC/6bwCnBY22AqcAeVuaheImz34OBt4FjgnffwsYAibaxDIBuBFYHLSWuA8B3s5z8M7y2ul2TSNW54JZFs7OAcA7EXgvJfoya4VHV6A7rKPq85KmCi4A8rcvCtiVFzfQtu0KAGg72wQcHzKzAczF+mIB8I4FtDnY7+cBr3QFzh0e5F7Xht+1B/QFsy0E4C7r19tGadZUFwJCJ1p0KiiOMNeAtz+wPRXQkGRIG7oiKVL3dMjYr0CRALjGRlaAbYFkdFpTt72LolNecYsoljBTAHwYGAiiOYC0oSvTPBu48Xl8XwA4no1icZKMrkwKXSqc6JPnAPAacHZX5tzh7XVAMQT/2AslQAagYm1JIBl5UoU0AGQDPZcE7gGddM9kAiDdiBu3391xOhRQfiWSAAU4FWlNEgV7v90DXrApvSQBIJ5HhgAo4uMEfROBg/Ksl4YAPJwZQ0sABErkTAwBUB5BFnGS6D5gRgiA4p8LksR9kFRmTgiAxKE8YQAocTQhBGCd/yVZ9Kif4bLH4Js2AJokCBTsHRwC8IMtTUkSAMpt9nCdIdXp/JkQBFIuseMNyhWWS5wEUlxQ8cE0b/B6W3yVBAAU+QpyI44EvAqcmwTuraSfFQGgMpI9gkCoqt46W+FDoddENYjfhCmQnZIAJ1g+w9ZAFXrQztTfTODecEJ1AkBcyzAGkuAWq8RneAhAhQDoAcgQsGVWJwCftmvJNm3axMCByi1CU1MTlZWVNDY2smLFChYvXsyaNTK9s1NVVRX9+vVjxIhCZ6gGAJ+EA0v1e4apscAw9kl+clplRU5giPnt27dHkxczo0aNory8nLq64Ohpi3YdAIoD+jlR0Vowk9zkqJbdSkGJLSxoa6rpzydNmsSCBQuYNWtWM2aHDRsWScDkyZMZNGgQ3bt3Z/369ehZ79692bFjB0uWLKFXr16RBGzcuJHhwwORra2tbYdUKAyucLhPWv0BYLa46fEqW4cKNERx81wgWLhwIaNHj6akRACmUyYAeioRF4NFRUUUFxejlR86dCgNDQ0+APX19ZSVlVFRUeEDKunSs+nTVaKcK70DnBq+tAqM9j63VNZTwmxLKjqqUjNFiuJTNgkQYzU1NWkSsHXrVp8RARD+H44UqoB+nzZNtcEpyk8K1IfW16e/gT5gVNWdWSvsqfzcCQ31tmdmfBBa2gPGjRvHypUrKS0t9TdBqYALQCgNkiCt+ObNm+nWrVszCYg/C7elkr1KiEa0HIzMXp8ya4RkJWgv6B48VoGRdCe3KvS2TgEXAKnG6tWrY+0BmlF1dXUOKqDqcrm9UWG7Ep/9wejWRksA6DdvdHqKaHcOlqh0dry7+mPAPO/+kK1QcpEtBbdtpRUKnO5ONDvTuVsE5tZMDrIBoN9118WxRK4G7t9NEKjINOll/o106wNbUYHwkX8RSmeHc2HnTmBuJ64gUQWIqmHl7kakkrcSMFFRQAwViEDQ0ajbF2ekXlIG+fJOGD3aF3gcGOPyp2DnWFWDZRPdOBcmVGSn3JnTs0qJh3aiahIJqy5vBP6HJdn048GoMDIrxQDAPxnUTlUFkn9LXwPSNXmQ/yepkFt7Ux93EkvBxCpzjQlApBLiWK6zlM3Ss/baoADpSDraXs0rdQeVjT8VjG65xKIcAfClQVdjdXPMgVzRZJ25qsn9ONbA+TdSSbNKebQPSe8zRdLkJJJ5AOCDoOLKW6xKqDDfIVmP8iF0ebJQ4TXdB5JBM9l1aMIxpeOKcC4Ek3NcP08AIpVQ9ETScE7zFZXPITBkQOlOozbOVvcjpwuZsFppmbC6mXsykIFz0FqRXIm8jrq8qJ0AREAo0K57rVcCko4WSGU4cjMEhi5/pzkoQD8r0mJauKbdA3T701VZXeNbA+blvLh2XioQABEQcqIkq9osB7d3chnvy6vRdr8OzG+F6vs/cM4xojBcMyUAAAAASUVORK5CYII=";
    function show(data) {
        document.body.appendChild(common_9.html("<img src=\"" + data + "\" />"));
    }
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
    describe("Snapshot", function () {
        it("Snapshot", function () {
            base_12.should(!!Snapshot, "Snapshot");
            base_12.should(!!Snapshot.render, "Snapshot.render");
            base_12.should(!!Snapshot.snapshot, "Snapshot.snapshot");
        });
        it("Converts a point to image data", function () {
            var feature = new ol.Feature(new ol.geom.Point([0, 0]));
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({ color: "black" }),
                    stroke: new ol.style.Stroke({
                        color: "white",
                        width: 10
                    })
                }),
                text: new ol.style.Text({
                    text: "Point",
                    fill: new ol.style.Fill({
                        color: "white"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "black",
                        width: 2,
                    }),
                    offsetY: 16
                })
            }));
            var data = Snapshot.snapshot(feature, 64);
            show(data);
            if (1 === window.devicePixelRatio) {
                if (data !== pointData)
                    show(pointData);
                base_12.shouldEqual(data, pointData, "point data as expected");
            }
        });
        it("Converts a triangle to image data", function () {
            var points = circle(50, 4);
            var feature = new ol.Feature(new ol.geom.Polygon([points]));
            feature.setStyle(createStyle("Triangle"));
            var data = Snapshot.snapshot(feature, 64);
            show(data);
        });
        it("Converts a diamond to image data", function () {
            var points = circle(50, 5);
            var feature = new ol.Feature(new ol.geom.Polygon([points]));
            feature.setStyle(createStyle("Diamond"));
            var data = Snapshot.snapshot(feature, 64);
            show(data);
        });
        it("Converts a polygon to image data", function () {
            var geom = new ol.geom.Polygon([circle(3 + 100 * Math.random())]);
            var feature = new ol.Feature(geom);
            base_12.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            feature.setStyle(createStyle("Circle"));
            var originalCoordinates = base_12.stringify(geom.getCoordinates());
            var data = Snapshot.snapshot(feature, 64);
            console.log(data);
            base_12.should(!!data, "snapshot returns data");
            show(data);
            var finalCoordinates = base_12.stringify(geom.getCoordinates());
            base_12.shouldEqual(originalCoordinates, finalCoordinates, "coordinates unchanged");
            base_12.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            if (1 === window.devicePixelRatio) {
                if (data !== pointData)
                    show(circleData);
                base_12.shouldEqual(data, circleData, "circle data as expected");
            }
        });
    });
    function createStyle(text) {
        if (text === void 0) { text = ""; }
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: "black"
            }),
            stroke: new ol.style.Stroke({
                color: "blue",
                width: 3
            }),
            text: new ol.style.Text({
                text: text,
                fill: new ol.style.Fill({
                    color: "white"
                }),
                stroke: new ol.style.Stroke({
                    color: "black",
                    width: 2,
                }),
                offsetY: 16
            })
        });
    }
});
define("node_modules/ol3-fun/tests/spec/zoom-to-feature", ["require", "exports", "openlayers", "node_modules/ol3-fun/tests/base", "node_modules/ol3-fun/ol3-fun/navigation"], function (require, exports, ol, base_13, navigation_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("zoomToFeature", function () {
        it("zoomToFeature", function (done) {
            base_13.should(!!navigation_2.zoomToFeature, "zoomToFeature");
            var map = new ol.Map({
                view: new ol.View({
                    zoom: 0,
                    center: [0, 0]
                })
            });
            var feature = new ol.Feature();
            var geom = new ol.geom.Point([100, 100]);
            feature.setGeometry(geom);
            map.once("postrender", function () {
                var res = map.getView().getResolution();
                var zoom = map.getView().getZoom();
                navigation_2.zoomToFeature(map, feature, {
                    duration: 200,
                    minResolution: res / 4,
                }).then(function () {
                    var _a = map.getView().getCenter(), cx = _a[0], cy = _a[1];
                    base_13.should(map.getView().getZoom() === zoom + 2, "zoom in two because minRes is 1/4 of initial res");
                    base_13.should(cx === 100, "center-x");
                    base_13.should(cy === 100, "center-y");
                    done();
                });
            });
        });
    });
});
define("node_modules/ol3-fun/tests/index", ["require", "exports", "node_modules/ol3-fun/tests/spec/api", "node_modules/ol3-fun/tests/spec/common", "node_modules/ol3-fun/tests/spec/slowloop", "node_modules/ol3-fun/tests/spec/openlayers-test", "node_modules/ol3-fun/tests/spec/parse-dms", "node_modules/ol3-fun/tests/spec/polyline", "node_modules/ol3-fun/tests/spec/snapshot", "node_modules/ol3-fun/tests/spec/zoom-to-feature"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("tests/packages/ol3-fun", ["require", "exports", "node_modules/ol3-fun/tests/index"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/common/defaults", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.filter(function (b) { return !!b; }).forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    exports.defaults = defaults;
});
define("node_modules/ol3-symbolizer/tests/base", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function describe(title, cb) {
        console.log(title || "undocumented test group");
        return window.describe(title, cb);
    }
    exports.describe = describe;
    function it(title, cb) {
        console.log(title || "undocumented test");
        return window.it(title, cb);
    }
    exports.it = it;
    function should(result, message) {
        console.log(message || "undocumented assertion");
        if (!result)
            throw message;
    }
    exports.should = should;
    function shouldEqual(a, b, message) {
        if (a != b)
            console.warn(a, b);
        should(a == b, message);
    }
    exports.shouldEqual = shouldEqual;
    function stringify(o) {
        return JSON.stringify(o, null, "\t");
    }
    exports.stringify = stringify;
});
define("node_modules/ol3-symbolizer/tests/common", ["require", "exports", "node_modules/ol3-symbolizer/ol3-symbolizer/common/assign", "node_modules/ol3-symbolizer/ol3-symbolizer/common/mixin", "node_modules/ol3-symbolizer/ol3-symbolizer/common/defaults", "node_modules/ol3-symbolizer/tests/base"], function (require, exports, assign_2, mixin_3, defaults_1, base_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("assign tests", function () {
        it("assign empty", function () {
        });
        it("assign number", function () {
            var target = {};
            assign_2.assign(target, "a", 100);
            base_14.should(target.a === 100, "");
        });
        it("assign object", function () {
            var target = {};
            assign_2.assign(target, "a", { "a": 100 });
            base_14.should(target.a.a === 100, "");
        });
    });
    describe("defaults tests", function () {
        it("defaults number", function () {
            base_14.should(defaults_1.defaults({}, { a: 100 }).a === 100, "");
            base_14.should(defaults_1.defaults(defaults_1.defaults({}, { a: 100 }), { a: 200 }).a === 100, "");
            var a = defaults_1.defaults({}, { a: 1 });
            base_14.should(a === defaults_1.defaults(a, { a: 2 }), "");
        });
    });
    describe("mixin tests", function () {
        it("mixin number", function () {
            base_14.should(mixin_3.mixin({}, { a: 100 }).a === 100, "");
            base_14.should(mixin_3.mixin(mixin_3.mixin({}, { a: 100 }), { a: 200 }).a === 200, "");
            var a = mixin_3.mixin({}, { a: 1 });
            base_14.should(a === mixin_3.mixin(a, { a: 2 }), "");
        });
    });
    describe("test accessing openlayers using amd", function () {
        it("log ol.style.Style", function () {
            require(["openlayers"], function (ol) {
                var style = ol.style.Style;
                base_14.should(!!style, "");
                console.log(style.toString());
            });
        });
    });
});
define("node_modules/ol3-symbolizer/ol3-symbolizer/styles/stroke/linedash", ["require", "exports"], function (require, exports) {
    "use strict";
    var dasharray = {
        solid: "none",
        shortdash: [4, 1],
        shortdot: [1, 1],
        shortdashdot: [4, 1, 1, 1],
        shortdashdotdot: [4, 1, 1, 1, 1, 1],
        dot: [1, 3],
        dash: [4, 3],
        longdash: [8, 3],
        dashdot: [4, 3, 1, 3],
        longdashdot: [8, 3, 1, 3],
        longdashdotdot: [8, 3, 1, 3, 1, 3]
    };
    return dasharray;
});
define("node_modules/ol3-symbolizer/tests/ol3-symbolizer", ["require", "exports", "node_modules/ol3-symbolizer/ol3-symbolizer/styles/stroke/linedash", "node_modules/ol3-symbolizer/tests/base", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, Dashes, base_15, ol3_symbolizer_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var converter = new ol3_symbolizer_2.StyleConverter();
    base_15.describe("OL Format Tests", function () {
        base_15.it("Ensures interface does not break", function () {
            var circle = {};
            circle.fill;
            circle.opacity;
            circle.radius;
            circle.snapToPixel;
            circle.stroke;
            var color = {};
            color === [1] || color == "";
            var fill = {};
            fill.color;
            fill.gradient;
            fill.image;
            fill.pattern;
            var icon = {};
            icon["anchor-x"];
            icon["anchor-y"];
            icon.anchor;
            icon.anchorOrigin;
            icon.anchorXUnits;
            icon.anchorYUnits;
            icon.color;
            icon.crossOrigin;
            icon.offset;
            icon.offsetOrigin;
            icon.opacity;
            icon.rotateWithView;
            icon.rotation;
            icon.scale;
            icon.size;
            icon.snapToPixel;
            icon.src;
            var image = {};
            image.opacity;
            image.rotateWithView;
            image.rotation;
            image.scale;
            image.snapToPixel;
        });
    });
    base_15.describe("OL StyleConverter API Tests", function () {
        base_15.it("StyleConverter API", function () {
            var converter = new ol3_symbolizer_2.StyleConverter();
            base_15.should(typeof converter.fromJson === "function", "fromJson exists");
            base_15.should(typeof converter.toJson === "function", "toJson exists");
        });
    });
    base_15.describe("OL StyleConverter Json Tests", function () {
        base_15.it("Circle Tests", function () {
            var baseline = {
                "circle": {
                    "fill": {
                        "color": "rgba(197,37,84,0.90)"
                    },
                    "opacity": 1,
                    "stroke": {
                        "color": "rgba(227,83,105,1)",
                        "width": 4.4
                    },
                    "radius": 7.3
                },
                "text": {
                    "fill": {
                        "color": "rgba(205,86,109,0.9)"
                    },
                    "stroke": {
                        "color": "rgba(252,175,131,0.5)",
                        "width": 2
                    },
                    "text": "Test",
                    "offset-x": 0,
                    "offset-y": 20,
                    "font": "18px fantasy"
                }
            };
            var style = converter.fromJson(baseline);
            var circleStyle = style.getImage();
            base_15.should(circleStyle !== null, "getImage returns a style");
            base_15.shouldEqual(circleStyle.getRadius(), baseline.circle.radius, "getImage is a circle and radius");
            var circleJson = converter.toJson(style);
            base_15.should(circleJson.circle !== null, "json contains a circle");
            base_15.shouldEqual(circleJson.circle.radius, baseline.circle.radius, "circle radius");
        });
        base_15.it("Star Tests", function () {
            var baseline = {
                "star": {
                    "fill": {
                        "color": "rgba(54,47,234,1)"
                    },
                    "stroke": {
                        "color": "rgba(75,92,105,0.85)",
                        "width": 4
                    },
                    "radius": 9,
                    "radius2": 0,
                    "points": 6
                }
            };
            var style = converter.fromJson(baseline);
            var starStyle = style.getImage();
            base_15.should(starStyle !== null, "getImage returns a style");
            base_15.shouldEqual(starStyle.getRadius(), baseline.star.radius, "starStyle radius");
            base_15.shouldEqual(starStyle.getRadius2(), baseline.star.radius2, "starStyle radius2");
            base_15.shouldEqual(starStyle.getPoints(), baseline.star.points, "starStyle points");
            var starJson = converter.toJson(style);
            base_15.should(starJson.star !== null, "json contains a star");
            base_15.shouldEqual(starJson.star.radius, baseline.star.radius, "starJson radius");
            base_15.shouldEqual(starJson.star.radius2, baseline.star.radius2, "starJson radius2");
            base_15.shouldEqual(starJson.star.points, baseline.star.points, "starJson point count");
        });
        base_15.it("Fill Test", function () {
            var baseline = {
                "fill": {
                    "gradient": {
                        "type": "linear(200,0,201,0)",
                        "stops": "rgba(255,0,0,.1) 0%;rgba(255,0,0,0.8) 100%"
                    }
                }
            };
            var style = converter.fromJson(baseline);
            var fillStyle = style.getFill();
            base_15.should(fillStyle !== null, "fillStyle exists");
            var gradient = fillStyle.getColor();
            base_15.shouldEqual(gradient.stops, baseline.fill.gradient.stops, "fillStyle color");
            base_15.shouldEqual(gradient.type, baseline.fill.gradient.type, "fillStyle color");
        });
        base_15.it("Stroke Test", function () {
            var baseline = {
                "stroke": {
                    "color": "orange",
                    "width": 2,
                    "lineDash": Dashes.longdashdotdot
                }
            };
            var style = converter.fromJson(baseline);
            var strokeStyle = style.getStroke();
            base_15.should(strokeStyle !== null, "strokeStyle exists");
            base_15.shouldEqual(strokeStyle.getColor(), baseline.stroke.color, "strokeStyle color");
            base_15.shouldEqual(strokeStyle.getWidth(), baseline.stroke.width, "strokeStyle width");
            base_15.shouldEqual(strokeStyle.getLineDash().join(), baseline.stroke.lineDash.join(), "strokeStyle lineDash");
        });
        base_15.it("Text Test", function () {
            var baseline = {
                "text": {
                    "fill": {
                        "color": "rgba(75,92,85,0.85)"
                    },
                    "stroke": {
                        "color": "rgba(255,255,255,1)",
                        "width": 5
                    },
                    "offset-x": 5,
                    "offset-y": 10,
                    offsetX: 15,
                    offsetY: 20,
                    "text": "fantasy light",
                    "font": "18px serif"
                }
            };
            var style = converter.fromJson(baseline);
            var textStyle = style.getText();
            base_15.should(textStyle !== null, "textStyle exists");
            base_15.shouldEqual(textStyle.getFill().getColor(), baseline.text.fill.color, "textStyle text color");
            base_15.shouldEqual(textStyle.getText(), baseline.text.text, "textStyle text");
            base_15.shouldEqual(textStyle.getOffsetX(), baseline.text["offset-x"], "textStyle color");
            base_15.shouldEqual(textStyle.getOffsetY(), baseline.text["offset-y"], "textStyle color");
            base_15.shouldEqual(textStyle.getFont(), baseline.text.font, "textStyle font");
        });
    });
    base_15.describe("OL Basic shapes", function () {
        base_15.it("cross, square, diamond, star, triangle, x", function () {
            var cross = {
                "star": {
                    "opacity": 0.5,
                    "fill": {
                        "color": "red"
                    },
                    "stroke": {
                        "color": "black",
                        "width": 2
                    },
                    "points": 4,
                    "radius": 10,
                    "radius2": 0,
                    "angle": 0
                }
            };
            var square = {
                "star": {
                    "fill": {
                        "color": "red"
                    },
                    "stroke": {
                        "color": "black",
                        "width": 2
                    },
                    "points": 4,
                    "radius": 10,
                    "angle": 0.7853981633974483
                }
            };
            var diamond = {
                "star": {
                    "fill": {
                        "color": "red"
                    },
                    "stroke": {
                        "color": "black",
                        "width": 2
                    },
                    "points": 4,
                    "radius": 10,
                    "angle": 0
                }
            };
            var star = {
                "star": {
                    "fill": {
                        "color": "red"
                    },
                    "stroke": {
                        "color": "black",
                        "width": 2
                    },
                    "points": 5,
                    "radius": 10,
                    "radius2": 4,
                    "angle": 0
                }
            };
            var triangle = {
                "star": {
                    "fill": {
                        "color": "red"
                    },
                    "stroke": {
                        "color": "black",
                        "width": 2
                    },
                    "points": 3,
                    "radius": 10,
                    "angle": 0
                }
            };
            var x = {
                "star": {
                    "fill": {
                        "color": "red"
                    },
                    "stroke": {
                        "color": "black",
                        "width": 2
                    },
                    "points": 4,
                    "radius": 10,
                    "radius2": 0,
                    "angle": 0.7853981633974483
                }
            };
            var crossJson = converter.toJson(converter.fromJson(cross));
            var squareJson = converter.toJson(converter.fromJson(square));
            var diamondJson = converter.toJson(converter.fromJson(diamond));
            var starJson = converter.toJson(converter.fromJson(star));
            var triangleJson = converter.toJson(converter.fromJson(triangle));
            var xJson = converter.toJson(converter.fromJson(x));
            base_15.should(!!crossJson.cross, "cross exists");
            base_15.shouldEqual(crossJson.cross.size, cross.star.radius * 2, "cross size");
            base_15.should(!!squareJson.square, "square exists");
            base_15.shouldEqual(squareJson.square.size, square.star.radius * 2, "square size");
            base_15.should(!!diamondJson.diamond, "diamond exists");
            base_15.shouldEqual(diamondJson.diamond.size, diamond.star.radius * 2, "diamond size");
            base_15.should(!!triangleJson.triangle, "triangle exists");
            base_15.shouldEqual(triangleJson.triangle.size, triangle.star.radius * 2, "triangle size");
            base_15.should(!!xJson.x, "x exists");
            base_15.shouldEqual(xJson.x.size, x.star.radius * 2, "x size");
            var items = { crossJson: crossJson, squareJson: squareJson, diamondJson: diamondJson, triangleJson: triangleJson, xJson: xJson };
            Object.keys(items).forEach(function (k) {
                base_15.shouldEqual(base_15.stringify(converter.toJson(converter.fromJson(items[k]))), base_15.stringify(items[k]), k + " json->style->json");
            });
        });
    });
    base_15.describe("OL NEXT", function () {
        base_15.it("NEXT", function () {
        });
    });
});
define("node_modules/ol3-symbolizer/tests/ags-symbolizer", ["require", "exports", "node_modules/ol3-symbolizer/tests/base", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer", "node_modules/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, base_16, ags_symbolizer_2, ol3_symbolizer_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fromJson = (function () {
        var fromJsonConverter = new ags_symbolizer_2.StyleConverter();
        return function (style) { return fromJsonConverter.fromJson(style); };
    })();
    var toJson = (function () {
        var toJsonConverter = new ol3_symbolizer_3.StyleConverter();
        return function (style) { return toJsonConverter.toJson(style); };
    })();
    function rgba(_a) {
        var r = _a[0], g = _a[1], b = _a[2], a = _a[3];
        return "rgba(" + r + "," + g + "," + b + "," + a / 255 + ")";
    }
    base_16.describe("esriSMS Tests", function () {
        base_16.it("esriSMSCircle", function () {
            var baseline = {
                "color": [
                    255,
                    255,
                    255,
                    64
                ],
                "size": 12,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [
                        0,
                        0,
                        0,
                        255
                    ],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            };
            var style = fromJson(baseline);
            var circleJson = toJson(style);
            var expectedRadius = (baseline.size * 4 / 3) / 2;
            base_16.shouldEqual(circleJson.circle.radius, expectedRadius, "circleJson radius is 33% larger than specified in the ags style (see StyleConverter.asWidth)");
            base_16.shouldEqual(circleJson.circle.fill.color, rgba(baseline.color), "circleJson fill color");
            base_16.shouldEqual(circleJson.circle.fill.pattern, null, "circleJson fill pattern is solid");
            base_16.shouldEqual(circleJson.circle.stroke.color, rgba(baseline.outline.color), "circleJson stroke color");
            base_16.shouldEqual(circleJson.circle.stroke.width, baseline.outline.width * 4 / 3, "circleJson stroke width");
            base_16.shouldEqual(circleJson.circle.stroke.lineCap, undefined, "circleJson stroke lineCap");
            base_16.shouldEqual(circleJson.circle.stroke.lineDash, undefined, "circleJson stroke lineDash");
            base_16.shouldEqual(circleJson.circle.stroke.lineJoin, undefined, "circleJson stroke lineJoin");
        });
        base_16.it("esriSMSCross", function () {
            var baseline = {
                "color": [
                    255,
                    255,
                    255,
                    64
                ],
                "size": 12,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCross",
                "outline": {
                    "color": [
                        0,
                        0,
                        0,
                        255
                    ],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            };
            var json = toJson(fromJson(baseline));
            base_16.should(!!json.cross, "cross");
            base_16.shouldEqual(json.cross.opacity, 1, "opacity");
            base_16.shouldEqual(json.cross.size, 22.62741699796952, "size");
        });
    });
    base_16.describe("esriSLS Tests", function () {
        base_16.it("esriSLSShortDash esriLCSSquare esriLJSRound", function () {
            var baseline = {
                "type": "esriSLS",
                "style": "esriSLSShortDash",
                "color": [
                    152,
                    230,
                    0,
                    255
                ],
                "width": 1,
                "cap": "esriLCSSquare",
                "join": "esriLJSRound",
                "miterLimit": 9.75
            };
            var style = fromJson(baseline);
            var json = toJson(style);
            base_16.shouldEqual(json.stroke.color, rgba(baseline.color), "stroke color");
        });
        base_16.it("esriSLSDash esriLCSButt esriLJSBevel", function () {
            var baseline = {
                "type": "esriSLS",
                "style": "esriSLSDash",
                "color": [
                    152,
                    230,
                    0,
                    255
                ],
                "width": 1,
                "cap": "esriLCSButt",
                "join": "esriLJSBevel",
                "miterLimit": 9.75
            };
            var style = fromJson(baseline);
            var json = toJson(style);
            base_16.shouldEqual(json.stroke.color, rgba(baseline.color), "stroke color");
        });
        base_16.it("esriSLSSolid esriLCSRound esriLJSMiter", function () {
            var baseline = {
                "type": "esriSLS",
                "style": "esriSLSSolid",
                "color": [
                    152,
                    230,
                    0,
                    255
                ],
                "width": 1,
                "cap": "esriLCSRound",
                "join": "esriLJSMiter",
                "miterLimit": 9.75
            };
            var style = fromJson(baseline);
            var json = toJson(style);
            base_16.shouldEqual(json.stroke.color, rgba(baseline.color), "stroke color");
        });
    });
});
define("node_modules/ol3-symbolizer/tests/index", ["require", "exports", "node_modules/ol3-symbolizer/tests/common", "node_modules/ol3-symbolizer/tests/ol3-symbolizer", "node_modules/ol3-symbolizer/tests/ags-symbolizer"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("tests/packages/ol3-symbolizer", ["require", "exports", "node_modules/ol3-symbolizer/tests/index"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=tests.max.js.map