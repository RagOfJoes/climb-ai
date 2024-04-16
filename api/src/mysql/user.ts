import { UserSchema, type Connection, type User } from "@/domains";
import type { Response } from "@/lib/response";
import type { UserRepository } from "@/repositories";

import type { MySQL } from ".";

export const USER_MYSQL_ERRORS = {
	DOES_NOT_EXIST: "User does not exist.",
	FAILED_TO_CREATE: "Failed to create user.",
	INVALID_USER: "Invalid user found.",
};

export interface UserMySQLDependencies {
	mysql: MySQL;
}

export class UserMySQL implements UserRepository {
	private db: MySQL;

	constructor(dependencies: UserMySQLDependencies) {
		this.db = dependencies.mysql;
	}

	public async create(
		user: User,
		connection: Connection,
	): Promise<Response<User>> {
		try {
			await this.db
				.get_db()
				.transaction()
				.execute(async (tx) => {
					await tx
						.insertInto("users")
						.values({
							id: user.id,
							email: user.email,
							created_at: user.created_at,
						})
						.executeTakeFirstOrThrow();

					await tx
						.insertInto("connections")
						.values({
							id: connection.id,
							provider: connection.provider,
							sub: connection.sub,
							user_id: user.id,
						})
						.executeTakeFirstOrThrow();
				});
		} catch (error) {
			return {
				success: false,
				error: USER_MYSQL_ERRORS.FAILED_TO_CREATE,
			};
		}

		return {
			success: true,
			data: user,
		};
	}

	public async get(id: string): Promise<Response<User>> {
		try {
			const user = await this.db
				.get_db()
				.selectFrom("users")
				.select(["id", "email", "created_at", "updated_at"])
				.where("id", "=", id)
				.where("deleted_at", "=", null)
				.executeTakeFirstOrThrow();

			const transformed_user: User = {
				id: user.id,
				email: user.email,
				created_at: user.created_at,
				updated_at: user.updated_at ?? undefined,
			};
			const parsed_user = UserSchema.safeParse(transformed_user);
			// NOTE: This should, ideally, never happen. Mainly for safety
			if (!parsed_user.success) {
				return {
					success: false,
					error: USER_MYSQL_ERRORS.INVALID_USER,
				};
			}

			return {
				success: true,
				data: parsed_user.data,
			};
		} catch (e) {
			return {
				success: false,
				error: USER_MYSQL_ERRORS.DOES_NOT_EXIST,
			};
		}
	}

	public async get_with_connection(
		provider: string,
		sub: string,
	): Promise<Response<User>> {
		try {
			const user = await this.db
				.get_db()
				.selectFrom("users")
				.innerJoin("connections", "connections.user_id", "users.id")
				.select([
					"users.id",
					"users.email",
					"users.created_at",
					"users.updated_at",
				])
				.where("connections.provider", "=", provider)
				.where("connections.sub", "=", sub)
				.where("users.deleted_at", "=", null)
				.executeTakeFirstOrThrow();

			const transformed_user: User = {
				id: user.id,
				email: user.email,
				created_at: user.created_at,
				updated_at: user.updated_at ?? undefined,
			};
			const parsed_user = UserSchema.safeParse(transformed_user);
			// NOTE: This should, ideally, never happen. Mainly for safety
			if (!parsed_user.success) {
				return {
					success: false,
					error: USER_MYSQL_ERRORS.INVALID_USER,
				};
			}

			return {
				success: true,
				data: parsed_user.data,
			};
		} catch (e) {
			return {
				success: false,
				error: USER_MYSQL_ERRORS.DOES_NOT_EXIST,
			};
		}
	}

	// eslint-disable-next-line class-methods-use-this
	public async update(): Promise<Response<User>> {
		throw new Error("Method not implemented.");
	}

	// eslint-disable-next-line class-methods-use-this
	public async delete(): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
