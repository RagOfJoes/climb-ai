import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { BlankInput, Env, H, HandlerResponse } from "hono/types";
import { config } from 'dotenv';

import type { Config } from "@/config";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";



config();


/**
 * Wrapper class around the Hono router. Allows for this to be easily interchangeable
 *
 */
export class Router {
	private config: Config;
	private router: Hono;
	private s3Client: S3Client;


	// TODO: Setup services

	constructor(config: Config) {
		this.config = config;
		this.router = new Hono();

		if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
			throw new Error('AWS credentials not found');
		}

		// Set up the S3 client
		this.s3Client = new S3Client({
			region: "us-west-2",
			credentials: {
				accessKeyId: "AKIA6GBMDZOUYFI2Z7WQ",
				secretAccessKey: "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",
			},
		});



		

		console.log('[handlers] Router initialized');
	}

	private setupRoutes(): void {
		// Setup the route to generate a presigned URL
		this.router.get('/presigned-url', async (c) => {
			const bucketName = "preprocessed-video-noraa"; // Your S3 Bucket
			const objectKey = `uploads/${Date.now()}`; // Generate a unique key for the object

			// Generate the presigned URL for PUT operations
			const command = new PutObjectCommand({
				Bucket: bucketName,
				Key: objectKey,
			});

			try {
				const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
				return c.json({ url });
			} catch (error) {
				console.error('Error generating S3 presigned URL:', error);
				return c.json({ error: 'Failed to generate presigned URL' }, 500);
			}
		});
	}




	public run(): void {
		this.setupRoutes();
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
