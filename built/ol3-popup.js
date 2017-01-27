var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jquery", "openlayers", "./paging/paging", "./paging/page-navigator"], function (require, exports, $, ol, paging_1, PageNavigator) {
    "use strict";
    var css = "\n.ol-popup:after {\n    bottom: -20px;\n    left: 50px;\n    border-top-color: black;\n}\n\n.ol-popup.docked {\n    bottom:0;\n    top:0;\n    left:0;\n    right:0;\n    pointer-events: all;\n    color: gold;\n    background: black;\n}\n\n.ol-popup.docked:after {\n    display:none;\n}\n\n.ol-popup.docked .pages {\n    max-height: inherit;\n    overflow: auto;\n    height: calc(100% - 60px);\n}\n\n.ol-popup .ol-popup-closer {\n    border: none;\n    background: transparent;\n    color: inherit;\n    position: absolute;\n    top: 0;\n    right: 0;\n    text-decoration: none;\n}\n    \n.ol-popup .ol-popup-closer:after {\n    content:'\u2716';\n}\n\n.ol-popup .ol-popup-docker {\n    border: none;\n    background: transparent;\n    color: inherit;\n    text-decoration: none;\n    position: absolute;\n    top: 0;\n    right: 20px;\n}\n\n.ol-popup .ol-popup-docker:after {\n    content:'\u25A1';\n}\n";
    $("<style type='text/css'>" + css + "</style>").appendTo('head');
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
            // the internal properties, dom and listeners are in place, time to create the popup
            this.postCreate();
        }
        Popup.prototype.postCreate = function () {
            var _this = this;
            var options = this.options;
            var domNode = this.domNode = document.createElement('div');
            domNode.className = classNames.olPopup;
            this.setElement(domNode);
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
        Popup.prototype.setPosition = function (position) {
            this.options.position = position;
            if (!this.isDocked()) {
                _super.prototype.setPosition.call(this, position);
            }
            else {
                this.options.map.getView().setCenter(position);
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
//# sourceMappingURL=ol3-popup.js.map