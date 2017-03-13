import ol = require("openlayers");
import { Popup } from "./ol3-popup";
import { defaults } from "ol3-fun/ol3-fun/common";

export interface SelectOptions extends olx.interaction.SelectOptions {
    map?: ol.Map;
    popup?: Popup;
}

// to be shared across all disposables via ol3-fun
type Disposables = Array<ol.Object | ol.Object[] | (() => void)>;
const dispose = (handlers: Disposables) =>
    handlers.forEach(h => (h instanceof Function) ? h() : ol.Observable.unByKey(h));

export class SelectInteraction {

    private handlers: Disposables;
    public options: SelectOptions;

    static DEFAULT_OPTIONS = <SelectOptions>{
        multi: true
    };

    static create(options: SelectOptions) {
        if (!options.popup) throw "popup is a required option";
        if (!options.map) {
            options.map = options.popup.options.map;
            if (!options.map) "map is a require option";
        }
        options = defaults(options, SelectInteraction.DEFAULT_OPTIONS);
        options.addCondition = options.addCondition || ol.events.condition.shiftKeyOnly;
        options.removeCondition = options.removeCondition || ol.events.condition.never;
        options.toggleCondition = options.addCondition || ol.events.condition.shiftKeyOnly;

        return new SelectInteraction(options);

    }

    private constructor(options: SelectOptions) {
        this.options = options;
        let popup = options.popup;
        let map = options.map;
        let overlay: ol.layer.Vector;

        this.handlers = [];

        this.handlers.push(map.on("click", (args: ol.MapBrowserPointerEvent) => {
            let wasDocked = popup.isDocked();

            if (!popup.options.multi || !options.addCondition(args)) {
                popup.pages.clear();
            }

            {
                let found = false;
                let extent = ol.extent.createEmpty();
                extent[0] = extent[2] = args.pixel[0];
                extent[1] = extent[3] = args.pixel[1];
                extent = ol.extent.buffer(extent, 4);

                [[extent[0], extent[3]], [extent[2], extent[1]]] = [
                    map.getCoordinateFromPixel([extent[0], extent[1]]),
                    map.getCoordinateFromPixel([extent[2], extent[3]])
                ];

                let layers = popup.options.layers;

                if (!layers) {
                    layers = <ol.layer.Vector[]>map.getLayers().getArray().filter(l => l instanceof ol.layer.Vector);
                }

                layers.forEach(layer => {
                    if (layer === overlay) return;
                    layer.getSource().forEachFeatureIntersectingExtent(extent, (feature: ol.Feature) => {
                        popup.pages.addFeature(feature, {
                            searchCoordinate: args.coordinate
                        });
                        found = true;
                        return !popup.options.multi;
                    });
                });

                if (!found) {
                    // this technique considers styling (e.g. point features and large borders)
                    map.forEachFeatureAtPixel(args.pixel, (feature: ol.Feature, layer: ol.layer.Vector) => {
                        if (!layer || layer === overlay || -1 === layers.indexOf(layer)) {
                            return;
                        }
                        popup.pages.addFeature(feature, {
                            searchCoordinate: args.coordinate
                        });
                        found = true;
                        return !popup.options.multi;
                    });
                }

                if (!found && popup.options.showCoordinates) {
                    popup.pages.add(`
<table>
<tr><td>lon</td><td>${args.coordinate[0].toPrecision(6)}</td></tr>
<tr><td>lat</td><td>${args.coordinate[1].toPrecision(6)}</td></tr>
</table>`
                        .trim()
                        , new ol.geom.Point(args.coordinate));

                    found = true;
                }

                if (found) {
                    popup.pages.goto(popup.pages.count - 1);
                    if (wasDocked && !popup.isDocked()) popup.dock();
                }
                else {
                    // we already cleared the pages, now hide the popup
                    if (!popup.options.multi || !options.addCondition(args)) {
                        popup.hide();
                    }
                }
            }
        }));

        if (popup.options.pagingStyle) {
            overlay = this.setupOverlay();
        }

        popup.on("dispose", () => this.destroy());
    }

    private setupOverlay() {
        let options = this.options;
        let popup = options.popup;

        let source = new ol.source.Vector({
            useSpatialIndex: false,
            wrapX: this.options.wrapX
        });

        let featureOverlay = new ol.layer.Vector({
            map: this.options.map,
            source: source,
            updateWhileAnimating: true,
            updateWhileInteracting: true
        });

        featureOverlay.setStyle((feature: ol.Feature, resolution) => {
            let pageIndex = source.getFeatures().indexOf(feature);
            return popup.options.pagingStyle(feature, resolution, pageIndex);
        });

        featureOverlay.setMap(this.options.map);

        this.handlers.push(() => this.options.map.removeLayer(featureOverlay));

        popup.pages.on("clear", () => {
            source.clear();
        });

        this.handlers.push(popup.pages.on("goto", () => featureOverlay.getSource().refresh()));

        popup.pages.on("add", args => {
            let feature = args.feature;
            if (feature) {
                feature = feature.clone();
                feature.setStyle(null);
                if (args.geom) {
                    feature.setGeometry(args.geom);
                }
            } else {
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
    }

    public destroy() {
        dispose(this.handlers);
    }
}
