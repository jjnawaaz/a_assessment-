import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

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
