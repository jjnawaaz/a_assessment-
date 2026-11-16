import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

/**
 * Initializes and exports the shared Prisma database client.
 *
 * Configures Prisma Client with the PostgreSQL driver adapter using
 * the application's database connection string.
 *
 * A single client instance is shared across the application to
 * avoid unnecessary database connections and resource usage.
 *
 * @throws {Error} If the database connection string is missing.
 */
const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
