import { z } from "zod";

export const ConfigSchema = z.object({
	Environment: z.enum(["development", "production"]),

	Database: z.object({
		Host: z.string(),
		Name: z.string(),
		Password: z.string(),
		Port: z.coerce.number().int().positive(),
		User: z.string(),
	}),

	// TODO: Add fields for security. ie CSRF, CORS, etc.
	Server: z.object({
		Host: z.string(),
		Port: z.coerce.number().int().positive(),
	}),

	Google: z.object({
		AuthURL: z.string().url(),
		ClientID: z.string(),
		ClientSecret: z.string(),
		RedirectURL: z.string().url(),
		TokenURL: z.string().url(),
	}),
});

export const DatabaseConfigSchema = ConfigSchema.pick({ Database: true });
export interface DatabaseConfig extends z.infer<typeof DatabaseConfigSchema> {}

export const ServerConfigSchema = ConfigSchema.pick({ Server: true });
export interface ServerConfig extends z.infer<typeof ServerConfigSchema> {}

export const GoogleConfigSchema = ConfigSchema.pick({ Google: true });
export interface GoogleConfig extends z.infer<typeof GoogleConfigSchema> {}

export interface Config extends z.infer<typeof ConfigSchema> {
    Server: any;
}

// Loads the configuration based on the environment variables
export function load_config(): z.SafeParseReturnType<unknown, Config> {
	console.log("[config] Loading configuration");

	const c = {
		Environment:
			process.env.NODE_ENV === "production" ? "production" : "development",

		Database: {
			Host: process.env.DB_HOST ?? "",
			Name: process.env.DB_NAME ?? "",
			Password: process.env.DB_PASSWORD ?? "",
			Port: parseInt(process.env.DB_PORT ?? "", 10),
			User: process.env.DB_USER ?? "",
		},
		Server: {
			Host: ":",
			Port: parseInt(process.env.SERVER_PORT ?? "5174", 10),
		},

		Google: {
			AuthURL: process.env.GOOGLE_AUTH_URL ?? "",
			ClientID: process.env.GOOGLE_CLIENT_ID ?? "",
			ClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
			RedirectURL: process.env.GOOGLE_REDIRECT_URL ?? "",
			TokenURL: process.env.GOOGLE_TOKEN_URL ?? "",
		},
	};

	return ConfigSchema.safeParse(c);
}
