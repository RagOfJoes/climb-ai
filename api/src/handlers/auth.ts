// TODO: Look to use some package like `@authjs` for this

import type { Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import type { BlankInput, Env } from "hono/types";
import { ulid } from "ulid";

import type { Config } from "@/config";
import type { Connection, User } from "@/domains";
import { USER_SERVICE_ERRORS, type UserService } from "@/services";

import type { Handler } from "./handler";
import type { Router } from "./router";

const STATE_COOKIE_NAME = "_state";

export interface GoogleTokenResponse {
	access_token: string;
	expires_in: number;
	id_token?: string;
	refresh_token?: string;
	scope: string;
	token_type: string;
}

export interface GoogleUserInfoResponse {
	sub?: string;
	email: string;
}

export interface AuthHandlerDependencies {
	config: Config;
	router: Router;
	user_service: UserService;
}

export class AuthHandler implements Handler {
	private config: Config;
	private cookie_secret: string;
	private router: Router;
	private user_service: UserService;

	constructor({ config, router, user_service }: AuthHandlerDependencies) {
		this.config = config;
		this.cookie_secret = ulid();
		this.router = router;
		this.user_service = user_service;
	}

	public attach(): void {
		this.router.get("/auth/google", this.authenticate_google);
		this.router.get("/auth/google/callback", this.authenticate_google_callback);
	}

	private async get_state_cookie<
		E extends Env,
		P extends string,
		I extends BlankInput,
	>(ctx: Context<E, P, I>) {
		try {
			const cookie = await getSignedCookie(
				ctx,
				STATE_COOKIE_NAME,
				this.cookie_secret,
			);
			if (!cookie || cookie === "") {
				return "";
			}

			return cookie;
		} catch (e) {
			console.error(
				"[handlers.auth:get_state_cookie] Failed to get state cookie: %s",
				e,
			);
		}

		return "";
	}

	private async set_state_cookie<
		E extends Env,
		P extends string,
		I extends BlankInput,
	>(ctx: Context<E, P, I>, path: string): Promise<string> {
		const state = ulid();

		try {
			const expires = new Date();
			expires.setMinutes(expires.getMinutes() + 10);
			await setSignedCookie(ctx, STATE_COOKIE_NAME, state, this.cookie_secret, {
				domain: this.config.Server.Host,
				expires,
				httpOnly: this.config.Environment === "production",
				path,
				sameSite: this.config.Environment === "production" ? "Strict" : "Lax",
				secure: this.config.Environment === "production",
			});
		} catch (e) {
			console.error(
				"[handlers.auth:set_state_cookie] Failed to set state cookie: %s",
				e,
			);
		}

		return state;
	}

	private async authenticate_google<
		E extends Env,
		P extends string,
		I extends BlankInput,
	>(ctx: Context<E, P, I>) {
		// TODO: Check if user is already authenticated

		const state = await this.set_state_cookie(ctx, ctx.req.path);

		const url = new URL(this.config.Google.AuthURL);
		url.searchParams.set("client_id", this.config.Google.ClientID);
		url.searchParams.set("response_type", "code");
		url.searchParams.set("redirect_uri", this.config.Google.RedirectURL);
		url.searchParams.set(
			"scope",
			"https://www.googleapis.com/auth/userinfo.profile	",
		);
		url.searchParams.set("state", state);

		return ctx.redirect(url.toString());
	}

	private async authenticate_google_callback<
		E extends Env,
		P extends string,
		I extends BlankInput,
	>(ctx: Context<E, P, I>) {
		// TODO: Check if user is already authenticated

		const code = ctx.req.query("code");
		if (!code) {
			ctx.status(400);
			return ctx.json({
				success: false,
				error: "Missing code.",
			});
		}

		const received_state = ctx.req.query("state");
		const saved_state = await this.get_state_cookie(ctx);
		if (received_state !== saved_state) {
			ctx.status(400);
			return ctx.json({
				success: false,
				error: "Invalid state.",
			});
		}

		try {
			const token_url = new URL(this.config.Google.TokenURL);
			token_url.searchParams.set("client_id", this.config.Google.ClientID);
			token_url.searchParams.set(
				"client_secret",
				this.config.Google.ClientSecret,
			);
			token_url.searchParams.set("code", code);
			token_url.searchParams.set(
				"redirect_uri",
				this.config.Google.RedirectURL,
			);
			token_url.searchParams.set("type", "web_server");
			const token_res = await fetch(token_url, {
				method: "POST",
			});

			const token_json: GoogleTokenResponse = await token_res.json();
			if (!token_json.access_token) {
				ctx.status(500);
				return ctx.json({
					success: false,
					error: "Failed to retrieve access token. Please try again later.",
				});
			}

			const userinfo_res = await fetch(
				"https://www.googleapis.com/oauth2/v2/",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token_json.access_token}`,
						"Content-Type": "application/json",
					},
				},
			);
			const userinfo_json: GoogleUserInfoResponse | undefined =
				await userinfo_res.json();
			if (!userinfo_json || !userinfo_json.sub) {
				ctx.status(500);
				return ctx.json({
					success: false,
					error:
						"Failed to retrieve profile from Google. Please try again later.",
				});
			}

			const found_user = await this.user_service.get_user_with_connection(
				"google",
				userinfo_json.sub,
			);
			if (found_user.success) {
				return ctx.json({
					user: found_user.data,
				});
			}

			if (found_user.error === USER_SERVICE_ERRORS.DOES_NOT_EXIST) {
				const new_user: User = {
					id: ulid(),
					email: userinfo_json.email,

					created_at: new Date(),
				};
				const new_connection: Connection = {
					id: ulid(),
					provider: "google",
					sub: userinfo_json.sub,
					user_id: new_user.id,
				};
				const created_user = await this.user_service.create(
					new_user,
					new_connection,
				);

				if (!created_user.success) {
					ctx.status(500);
					return ctx.json({
						success: false,
						error: "Failed to create user. Please try again later.",
					});
				}

				return ctx.json({
					user: created_user.data,
				});
			}

			return ctx.json({
				success: true,
				data: userinfo_json,
			});
		} catch (e) {
			console.error("[handlers.auth:authenticate_google_callback]: ", e);
		}

		ctx.status(500);
		return ctx.json({
			success: false,
			error: "Failed to authenticate with Google. Please try again later.",
		});
	}
}
