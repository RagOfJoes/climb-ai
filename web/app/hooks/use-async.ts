import { useCallback, useEffect, useState } from "react";

export function useAsync(callback: () => Promise<void>, dependencies = []) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const [value, setValue] = useState();

	const callbackMemoized = useCallback(() => {
		setLoading(true);
		setError(undefined);
		setValue(undefined);

		callback()
			// @ts-expect-error
			.then(setValue)
			.catch(setError)
			.finally(() => setLoading(false));
	}, dependencies);

	useEffect(() => {
		callbackMemoized();
	}, [callbackMemoized]);

	return { loading, error, value };
}
