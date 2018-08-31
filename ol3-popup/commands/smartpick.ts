import { IPopup } from "../@types/popup";

type VerticalPosition = "top" | "center" | "bottom";
type HorizontalPosition = "left" | "center" | "right";

/**
 * @param popup Returns a suggested overlay positioning based on the current state of this popup
 */
export function smartpick(popup: IPopup, threshold?: number) {
    if (typeof threshold !== "number") {
        threshold = (popup.options.autoPanMargin || 0) + (popup.options.pointerPosition || 0);
    }
    // capture current positioning
    let [verticalPosition, horizontalPosition] = popup.getPositioning().split("-", 2) as [VerticalPosition, HorizontalPosition];

    // compute border distances
    let targetPosition = popup.getPosition();
    let [x, y] = popup.options.map.getPixelFromCoordinate(targetPosition);
    let [width, height] = popup.options.map.getSize();
    let distanceToLeft = x;
    let distanceToTop = y;
    let distanceToRight = width - x;
    let distanceToBottom = height - y;

    if (distanceToTop < threshold) verticalPosition = "top";
    else if (distanceToBottom < threshold) verticalPosition = "bottom";
    else verticalPosition = null; // no opinion

    if (distanceToLeft < threshold) horizontalPosition = "left";
    else if (distanceToRight < threshold) horizontalPosition = "right";
    else horizontalPosition = "center";

    // If very close to the right or left edge and not close to the top or bottom edge 
    // then the popup appears to the left/right of the marker (center-*)
    if (!verticalPosition && horizontalPosition !== "center") {
        verticalPosition = "center";
    }    
    horizontalPosition = horizontalPosition || "center";
    verticalPosition = verticalPosition || ((distanceToTop < distanceToBottom) ? "top" : "bottom");
    
    return <ol.OverlayPositioning>`${verticalPosition}-${horizontalPosition}`;
};
