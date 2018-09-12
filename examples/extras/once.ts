export function once<T>(
	map: {
		once: Function;
	},
	event: string,
	cb: () => T
): JQueryDeferred<T> {
	let d = $.Deferred<T>();
	map.once(event, () => {
		try {
			$.when(cb())
				.then(result => d.resolve(result))
				.catch(ex => d.reject(ex));
		} catch (ex) {
			d.reject(ex);
		}
	});
	return d;
}
