import ol = require("openlayers");
import { Popup } from "./ol3-popup";
import { defaults } from "ol3-fun/ol3-fun/common";

export interface IOptions extends olx.interaction.SelectOptions {
    map?: ol.Map;
    popup?: Popup;
    showCoordinates?: boolean;
}

export class SelectInteraction {

    private handlers: Array<() => void>;
    public options: IOptions;

    static DEFAULT_OPTIONS = <IOptions>{
        multi: true,
        showCoordinates: true
    };

    static create(options: IOptions) {
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

    private constructor(options: IOptions) {
        this.options = options;
        let popup = options.popup;
        let map = options.map;
        let overlay: ol.layer.Vector;

        this.handlers = [];

        let h = map.on("click", (args: ol.MapBrowserPointerEvent) => {
            if (!popup.options.multi || !options.addCondition(args)) {
                popup.hide();
            }

            {
                let found = false;
                map.forEachFeatureAtPixel(args.pixel, (feature: ol.Feature, layer) => {
                    if (!layer || layer === overlay) {
                        return;
                    }
                    popup.pages.addFeature(feature, {
                        searchCoordinate: args.coordinate
                    });
                    found = true;
                    return !popup.options.multi;
                });

                if (!found && options.showCoordinates) {
                    popup.pages.add(`
<table>
<tr><td>lon</td><td>${args.coordinate[0].toFixed(5)}</td></tr>
<tr><td>lat</td><td>${args.coordinate[1].toFixed(5)}</td></tr>
</table>`
                        .trim()
                        , new ol.geom.Point(args.coordinate));
                }
            }
            popup.pages.goto(popup.pages.count - 1);

        });
        this.handlers.push(() => ol.Observable.unByKey(h));

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

        popup.pages.on("goto", () => featureOverlay.getSource().refresh());

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
        this.handlers.forEach(h => h());
    }
}
