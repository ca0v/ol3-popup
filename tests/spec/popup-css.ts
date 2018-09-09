import { describe, it, should, slowloop, stringify } from "ol3-fun/tests/base";
import { range, cssin } from "ol3-fun/ol3-fun/common";

function rect(extent: ol.Extent) {
	let [x1, y1, x2, y2] = extent;
	return [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]] as Array<ol.Coordinate>;
}

function callout(
	points: ol.Pixel[],
	options: {
		index: number;
		size: number;
		width: number;
		skew: number;
		offset: number;
	}
) {
	let { index, size, width, offset, skew } = options;
	let a = points[index];
	let c = points[index + 1];
	let isVertical = a[0] === c[0];
	let isHorizontal = a[1] === c[1];
	let isLeft = isVertical && a[1] > c[1];
	let isRight = isVertical && a[1] < c[1];
	let isTop = isHorizontal && a[0] < c[0];
	let isBottom = isHorizontal && a[0] > c[0];
	let b: ol.Pixel = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
	if (isHorizontal) {
		b[0] += offset;
	}
	if (isVertical) {
		b[1] += offset; //isRight ? offset : isLeft ? -offset : 0;
	}
	let b0: ol.Pixel = [b[0], b[1]];
	let b1: ol.Pixel = [b[0], b[1]];
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

describe("ol3-popup/popup-css", () => {
	it("▲▼◀▶△▽◁▷", () => {
		// TODO - uses different symbols for tooltip
	});

	it("renders a tooltip on a canvas", () => {
		let div = document.createElement("div");
		div.className = "canvas-container";
		cssin(
			"canvas-test",
			`.canvas-container {
            display: inline-block;
            position: absolute;
            top: 20px;
            width: 200px;
            height: 200px;
            border: 1px solid white;
        }`
		);
		div.innerHTML = "DIV CONTENT";
		let canvas = document.createElement("canvas");
		canvas.width = canvas.height = 200;
		canvas.style.position = "absolute";
		canvas.style.top = canvas.style.left = canvas.style.right = canvas.style.bottom = "0";
		div.appendChild(canvas);

		document.body.insertBefore(div, document.body.firstChild);

		let ctx = canvas.getContext("2d");
		ctx.strokeStyle = "white";
		ctx.lineWidth = 3;

		let clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

		slowloop(
			range(30).map(n => () => {
				div.style.left = div.style.top = 10 * n + "px";
			}),
			100
		);

		let loop = [
			() => {
				let points = rect([10, 10, 190, 190]);
				clear();
				ctx.beginPath();
				ctx.moveTo(points[0][0], points[0][1]);
				points.forEach(p => ctx.lineTo(p[0], p[1]));
				ctx.closePath();
				ctx.stroke();
			}
		];
		{
			let points = range(4).map(index =>
				callout(rect([25, 25, 175, 175]), { index: index, size: 25, width: 25, skew: 10, offset: 20 })
			);
			loop = loop.concat(
				points.map(points => () => {
					clear();
					ctx.beginPath();
					ctx.moveTo(points[0][0], points[0][1]);
					points.forEach(p => ctx.lineTo(p[0], p[1]));
					ctx.closePath();
					ctx.stroke();
				})
			);
		}
		slowloop(loop, 200).then(() => {
			loop = [];
			let points = range(140).map(index =>
				callout(rect([20, 20, 180, 180]), { index: 0, size: 10, width: 20, skew: 0, offset: index - 70 })
			);
			points = points.concat(
				range(140).map(index =>
					callout(rect([20, 20, 180, 180]), {
						index: 1,
						size: 10,
						width: 20,
						skew: 0,
						offset: index - 70
					})
				)
			);
			points = points.concat(
				range(140)
					.reverse()
					.map(index =>
						callout(rect([20, 20, 180, 180]), {
							index: 2,
							size: 10,
							width: 20,
							skew: 0,
							offset: index - 70
						})
					)
			);
			points = points.concat(
				range(140)
					.reverse()
					.map(index =>
						callout(rect([20, 20, 180, 180]), {
							index: 3,
							size: 10,
							width: 20,
							skew: 0,
							offset: index - 70
						})
					)
			);
			loop = loop.concat(
				points.map(points => () => {
					clear();
					ctx.beginPath();
					ctx.moveTo(points[0][0], points[0][1]);
					points.forEach(p => ctx.lineTo(p[0], p[1]));
					ctx.closePath();
					ctx.stroke();
				})
			);
			slowloop(loop, 0, 1).then(() => slowloop(loop.reverse(), 0, 1));
		});
	});
});
