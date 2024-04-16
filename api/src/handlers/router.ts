import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { BlankInput, Env, H, HandlerResponse } from "hono/types";

import type { Config } from "@/config";

/**
 * Wrapper class around the Hono router. Allows for this to be easily interchangeable
 *
 */
export class Router {
	private config: Config;
	private router: Hono;

	// TODO: Setup services

	constructor(config: Config) {
		this.config = config;
		this.router = new Hono();

		console.log("[handlers] Router initialized");
	}

	public run(): void {
		this.router.routes.forEach((route) => {
			console.log("[handlers] Attached %s %s", route.method, route.path);
		});

		serve({
			fetch: this.router.fetch,
			port: this.config.Server.Port,
		});

		console.log(
			"[handlers] Server is now running on port %d",
			this.config.Server.Port,
		);
	}

	/**
	 * Methods for defining routes
	 *
	 */

	/**
	 * Add a DELETE route
	 *
	 */
	public delete<E extends Env, I extends BlankInput, R>(
		path: string,
		callback: H<E, typeof path, I, HandlerResponse<R>>,
	) {
		this.router.delete(path, callback);
	}

	/**
	 * Add a GET route
	 *
	 */
	public get<E extends Env, I extends BlankInput, R>(
		path: string,
		callback: H<E, typeof path, I, HandlerResponse<R>>,
	) {
		this.router.get(path, callback);
	}

	/**
	 * Add a POST route
	 *
	 */
	public post<E extends Env, I extends BlankInput, R>(
		path: string,
		callback: H<E, typeof path, I, HandlerResponse<R>>,
	) {
		this.router.post(path, callback);
	}

	/**
	 * Add a PUT route
	 *
	 */
	public put<E extends Env, I extends BlankInput, R>(
		path: string,
		callback: H<E, typeof path, I, HandlerResponse<R>>,
	) {
		this.router.put(path, callback);
	}
}
