import ol = require("openlayers");
import { PopupOptions } from "./popup-options";

/**
 * This is the contract that will not break between versions
 */
export interface IPopup_4_0_1<T> extends ol.Overlay {
    // show popup at this coordinate
    show(position: ol.Coordinate, markup: string): T;
    // close popup
    hide(): T;
    // true when open
    isOpened(): boolean;
    // destroy and cleanup
    destroy(): void;
    // pan map so infoviewer is fully within view
    panIntoView(): void;
    // true when docked
    isDocked(): boolean;
    // changes the infoViewer relative to actual target location (pixels)
    applyOffset([x, y]: [number, number]): void;
}

export interface IPopup_5_1_3<T> extends IPopup_4_0_1<T> {
    options: PopupOptions;
    content: HTMLElement;
    pages: any;
    dock(): void;
    undock(): void;
}

export interface IPopup extends IPopup_5_1_3<any> {
}