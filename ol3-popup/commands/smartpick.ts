import { IPopup } from "../@types/popup";
type VerticalPosition = "top" | "center" | "bottom";
type HorizontalPosition = "left" | "center" | "right";

export function smartpick(popup: ol.Overlay & IPopup) {
    let [verticalPosition, horizontalPosition] = popup.getPositioning().split("-", 2) as [VerticalPosition, HorizontalPosition];
    let threshold = popup.options.autoPanMargin;
    let targetPosition = popup.getPosition();
    let [x, y] = popup.options.map.getPixelFromCoordinate(targetPosition);
    let [width, height] = popup.options.map.getSize();
    let distanceToLeft = x;
    let distanceToTop = y;
    let distanceToRight = width - x;
    let distanceToBottom = height - y;
    if (distanceToTop < threshold) verticalPosition = "top";
    else if (distanceToBottom < threshold) verticalPosition = "bottom";
    else verticalPosition = verticalPosition || "center";
    if (distanceToLeft < threshold) horizontalPosition = "left";
    else if (distanceToRight < threshold) horizontalPosition = "right";
    else horizontalPosition = "center";
    return <ol.OverlayPositioning>`${verticalPosition}-${horizontalPosition}`;
};
