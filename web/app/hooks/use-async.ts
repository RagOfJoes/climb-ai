import type { DependencyList } from "react";
import { useEffect } from "react";

import type { FunctionReturningPromise } from "./use-async-fn";
import useAsyncFn from "./use-async-fn";

export function useAsync<T extends FunctionReturningPromise>(fn: T, deps: DependencyList = []) {
	const [state, callback] = useAsyncFn(fn, deps, {
		loading: true,
	});

	useEffect(() => {
		callback();
	}, [callback]);

	return state;
}
