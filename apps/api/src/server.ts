import cors from "@fastify/cors";
import Fastify from "fastify";
import { env } from "./env.js";
import { registerRoutes } from "./routes.js";

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: [env.webOrigin, "http://localhost:3000"],
    credentials: true,
  });

  app.get("/health", async () => ({
    ok: true,
    service: "foliotree-api",
    version: "0.1.0",
  }));

  await registerRoutes(app);

  return app;
}

const app = await buildServer();

try {
  await app.listen({ port: env.port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
