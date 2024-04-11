import { serve } from "@hono/node-server";
import { Hono } from "hono";
import mysql from "mysql2/promise";

import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

const app = new Hono();

const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const redirectUri = "http://localhost:5478/auth/google/callback";

// Before making the request, log the values to ensure they are not undefined
console.log('Client ID:', googleClientId);
console.log('Client Secret:', googleClientSecret);

// Database connection settings
const dbConfig = {
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
};

interface TokenResponse {
	access_token: string;
	expires_in: number;
	refresh_token?: string;
	scope: string;
	id_token?: string;
	token_type: string;
}
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
// Redirect to Google's OAuth 2.0 server
app.get('/auth/google', (c) => {
	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email&access_type=offline&prompt=consent`;
	return c.redirect(authUrl);
});

// Handle the callback from Google's OAuth 2.0 server.
app.get('/auth/google/callback', async (c) => {
	const code = c.req.query('code');
	if (!code) {
		return c.json({ error: 'Code is required' }, 400);
	}

	// Exchange code for access token
	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			code,
			client_id: googleClientId,
			client_secret: googleClientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
		}),
	});

	const tokenData = (await tokenResponse.json()) as TokenResponse;
	if (!tokenData.access_token) {
		return c.json({ error: 'Failed to obtain access token' }, 400);
	}

	// Optionally, use access token to fetch user info from Google
	const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`,
		},
	});

	const userInfo = await userInfoResponse.json();

	// Here, you can create or update the user in your database using userInfo

	// Redirect or respond based on your application's needs
	return c.json({ message: 'Authenticated successfully', user: userInfo });
});

const port = 5478;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
