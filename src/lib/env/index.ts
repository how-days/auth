/* eslint-disable no-process-env */
import { config } from "dotenv";
import { z } from "zod";

import { logger } from "@rharkor/logger";
import { createEnv } from "@t3-oss/env-nextjs";

if (!process.env.NEXT_PUBLIC_ENV) {
  config();
}

export const env = createEnv({
  server: {
    ENV: z.enum(["development", "staging", "preproduction", "production"]),
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    PASSWORD_HASHER_SECRET: z.string(),
    DATABASE_PRISMA_URL: z.string().min(1),
    DATABASE_URL_NON_POOLING: z.string().optional(),
    AUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_ENV: z
      .enum(["development", "staging", "preproduction", "production"])
      .optional(),
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    ENV: process.env.ENV,
    ANALYZE: process.env.ANALYZE,
    PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
    DATABASE_PRISMA_URL: process.env.DATABASE_PRISMA_URL,
    DATABASE_URL_NON_POOLING: process.env.DATABASE_URL_NON_POOLING,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  onValidationError: (error) => {
    logger.error(error);
    throw "Invalid environment variables";
  },
  onInvalidAccess(variable) {
    logger.error(`Invalid access to ${variable}`);
    throw "Invalid environment variables";
  },
});
