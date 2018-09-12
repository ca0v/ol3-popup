import { slowloop } from "ol3-fun/tests/base";
import { IPopup } from "../../index";
/**
 * Unless the pointer moves within the map...
 * @param popup destroy this and associated map
 * @param delay after this many milliseconds
 */
export function kill(popup: IPopup, delay = 1000) {
	let cancel = false;
	popup.getMap().once("pointermove", () => {
		cancel = true;
	});
	return () =>
		slowloop(
			[
				() => {
					if (cancel) throw "cancelled by user via pointermove";
					(popup.getMap().getTarget() as HTMLElement).remove();
					popup.getMap().setTarget(null);
					popup.destroy();
				}
			],
			delay
		);
}
