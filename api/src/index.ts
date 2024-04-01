import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) =>
	c.json({
		message: "Hello, World!",
	}),
);

const port = 5478;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
