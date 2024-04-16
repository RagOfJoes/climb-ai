import { z } from "zod";

export const UserSchema = z.object({
	id: z.string().ulid(),
	email: z.string().email(),

	created_at: z.date(),
	updated_at: z.optional(z.date()),
	deleted_at: z.optional(z.date()),
});
export interface User extends z.infer<typeof UserSchema> {}

export const ConnectionSchema = z.object({
	id: z.string().ulid(),
	provider: z.enum(["google"]),
	sub: z.string().min(1).max(128),
	user_id: z.string().ulid(),
});
export interface Connection extends z.infer<typeof ConnectionSchema> {}
