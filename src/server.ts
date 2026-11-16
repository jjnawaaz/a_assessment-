import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./lib/prisma.js";

/**
 * Starts the Express HTTP server and manages its lifecycle.
 *
 * Listens for incoming requests on the configured application port
 * and registers graceful shutdown handlers for SIGTERM and SIGINT.
 *
 * During shutdown, the server stops accepting new connections and
 * disconnects the Prisma client to release database resources.
 *
 * @remarks
 * Graceful shutdown ensures that database connections are properly
 * closed when the process is terminated.
 */
const server = app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

/**
 * Gracefully shuts down the HTTP server and disconnects the database.
 *
 * @param signal - Operating system signal that triggered shutdown.
 */
const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
