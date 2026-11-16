import "dotenv/config";

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
