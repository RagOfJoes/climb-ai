import type { Connection, User } from "@/domains";
import { ConnectionSchema, UserSchema } from "@/domains";
import type { Response } from "@/lib/response";
import type { UserRepository } from "@/repositories";

export const USER_SERVICE_ERRORS = {
	DOES_NOT_EXIST: "User does not exist.",
	FAILED_TO_CREATE: "Failed to create user.",
	INVALID_CONNECTION: "Invalid connection provided.",
	INVALID_USER: "Invalid user provided.",
};

export interface UserServiceDependencies {
	repository: UserRepository;
}

export class UserService {
	private repository: UserRepository;

	constructor(dependencies: UserServiceDependencies) {
		this.repository = dependencies.repository;
	}

	public async create(
		new_user: User,
		new_connection: Connection,
	): Promise<Response<User>> {
		const user_parsed = UserSchema.safeParse(new_user);
		if (!user_parsed.success) {
			return {
				success: false,
				error: USER_SERVICE_ERRORS.INVALID_USER,
			};
		}

		const connection_parsed = ConnectionSchema.safeParse(new_connection);
		if (!connection_parsed.success) {
			return {
				success: false,
				error: USER_SERVICE_ERRORS.INVALID_USER,
			};
		}

		const { data: valid_user } = user_parsed;
		const { data: valid_connection } = connection_parsed;
		const created_user = await this.repository.create(
			valid_user,
			valid_connection,
		);
		// TODO: Check for error message here
		if (!created_user.success) {
			return {
				success: false,
				error: USER_SERVICE_ERRORS.FAILED_TO_CREATE,
			};
		}

		return {
			success: true,
			data: created_user.data,
		};
	}

	public async get_user(id: string): Promise<Response<User>> {
		return this.repository.get(id);
	}

	public async get_user_with_connection(
		provider: string,
		sub: string,
	): Promise<Response<User>> {
		const found_user = await this.repository.get_with_connection(provider, sub);
		if (!found_user.success) {
			return {
				success: false,
				error: USER_SERVICE_ERRORS.DOES_NOT_EXIST,
			};
		}

		return {
			success: true,
			data: found_user.data,
		};
	}

	public async update_user(user: User): Promise<Response<User>> {
		return this.repository.update(user);
	}

	public async delete_user(user: User): Promise<void> {
		return this.repository.delete(user);
	}
}
