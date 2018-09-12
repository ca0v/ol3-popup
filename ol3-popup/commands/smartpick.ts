import { IPopup } from "../@types/popup";

type VerticalPosition = "top" | "center" | "bottom";
type HorizontalPosition = "left" | "center" | "right";

/**
 * @param popup Returns a suggested overlay positioning based on the current state of this popup
 */
export function smartpick(popup: IPopup, targetPosition?: ol.Coordinate, threshold?: number) {
	if (!targetPosition) {
		targetPosition = popup.getPosition();
	}

	let padding = [0, 0];

	if (typeof threshold !== "number") {
		threshold = (popup.options.autoPanMargin || 0) + (popup.options.pointerPosition || 0);
		let content = popup.content as HTMLElement; // declare in IPopup
		let style = getComputedStyle(content);
		// when the width or height is "auto" use the threshold as the expected width/height
		let [w, h] = [style.width, style.height].map(n => parseInt(n)).map(n => (isNaN(n) ? threshold : n));
		padding = [threshold + w / 2, threshold + h / 2];
	} else {
		padding = [threshold, threshold];
	}

	// capture current positioning
	let [verticalPosition, horizontalPosition] = popup.getPositioning().split("-", 2) as [
		VerticalPosition,
		HorizontalPosition
	];

	// compute border distances
	let [x, y] = popup.options.map.getPixelFromCoordinate(targetPosition);
	let [width, height] = popup.options.map.getSize();
	let distanceToLeft = x;
	let distanceToTop = y;
	let distanceToRight = width - x;
	let distanceToBottom = height - y;

	if (distanceToTop < padding[1]) verticalPosition = "top";
	else if (distanceToBottom < padding[1]) verticalPosition = "bottom";
	else verticalPosition = null; // no opinion

	if (distanceToLeft < padding[0]) horizontalPosition = "left";
	else if (distanceToRight < padding[0]) horizontalPosition = "right";
	else horizontalPosition = "center";

	// If very close to the right or left edge and not close to the top or bottom edge
	// then the popup appears to the left/right of the marker (center-*)
	if (!verticalPosition && horizontalPosition !== "center") {
		verticalPosition = "center";
	}
	horizontalPosition = horizontalPosition || "center";
	verticalPosition = verticalPosition || (distanceToTop < distanceToBottom ? "top" : "bottom");

	return <ol.OverlayPositioning>`${verticalPosition}-${horizontalPosition}`;
}
