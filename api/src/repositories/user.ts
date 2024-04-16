import type { Connection, User } from "@/domains";
import type { Response } from "@/lib/response";

export interface UserRepository {
	create(user: User, connection: Connection): Promise<Response<User>>;
	get(id: string): Promise<Response<User>>;
	get_with_connection(provider: string, sub: string): Promise<Response<User>>;
	update(user: User): Promise<Response<User>>;
	delete(user: User): Promise<void>;
}
