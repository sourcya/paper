/** @jsx jsx */
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { Page } from "./page.tsx";

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./" }));

app.get("/", (c) => c.html(<Page />));

console.log("🚀 Server running on http://localhost:3000");
Deno.serve({ port: 3000 }, app.fetch);
