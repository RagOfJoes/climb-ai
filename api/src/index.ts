import { load_config } from "@/config";
import { AuthHandler, Router } from "@/handlers";
import { MySQL, UserMySQL } from "@/mysql";

import { UserService } from "./services";

async function main() {
	// Load the configuration
	const loaded_config = load_config();
	if (!loaded_config.success) {
		console.error(
			"[config] Failed to load configuration %s",
			loaded_config.error,
		);
		process.exit(1);
	}
	const { data: config } = loaded_config;

	// Connect to the database
	const mysql = new MySQL(config);
	mysql.connect();

	// Setup repositories
	const user_mysql = new UserMySQL({
		mysql,
	});

	// Setup services
	const user_service = new UserService({
		repository: user_mysql,
	});

	// Setup HTTP server
	const router = new Router(config);
	// Initialize all handlers
	const auth_handler = new AuthHandler({ config, router, user_service });
	// Attach all handlers
	auth_handler.attach();
	// Run HTTP server
	router.run();
}

main();
