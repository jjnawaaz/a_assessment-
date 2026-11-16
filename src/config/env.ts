import "dotenv/config";

/**
 * Validates and centralizes application environment configuration.
 *
 * Loads environment variables from the .env file and ensures all
 * required variables are present before the application starts.
 *
 * Exposes typed configuration values with development defaults
 * for optional settings such as NODE_ENV, PORT, and APP_URL.
 *
 * @throws {Error} If a required environment variable is missing.
 */
const requiredEnvVariables = ["DATABASE_URL"] as const;

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: process.env.DATABASE_URL!,
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
} as const;
