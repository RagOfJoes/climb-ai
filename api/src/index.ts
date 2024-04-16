import { serve } from "@hono/node-server";
import { Hono } from "hono";
import mysql from "mysql2/promise";

import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

const app = new Hono();

// Database connection settings
const dbConfig = {
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
};

// sql query that creates tables (as listed in the Exaclidraw diagram)
/*use climb_ai;

CREATE TABLE IF NOT EXISTS users(
	id VARCHAR(36) PRIMARY KEY,
	username VARCHAR(255) UNIQUE NOT NULL,
	oid VARCHAR(36) UNIQUE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS folders(
	id VARCHAR(36) PRIMARY KEY,
	user_id VARCHAR(36) NOT NULL,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP NULL DEFAULT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS files(
	id VARCHAR(36) PRIMARY KEY,
	user_id VARCHAR(36) NOT NULL,
	folder_id VARCHAR(36),
	url TEXT NOT NULL,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP NULL DEFAULT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(folder_id) REFERENCES folders(id)
);*/

// User interface
interface User {
	id: string;
	username: string;
	oid: string;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

app.get("/", async (c) => {
	// Create a new MySQL connection
	const connection = await mysql.createConnection(dbConfig);

	// Execute a simple query
	const [rows]: [User[]] = await connection.execute('SELECT * FROM users') as unknown as [User[]];

	// Close the connection
	await connection.end();

	// Check if we have at least one user in the result
	if (rows.length > 0) {
		return c.json({
			message: "User data retrieved successfully",
			user: rows
		});
	} else {
		return c.json({
			message: "No users found"
		});
	}
});

const port = 5478;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
