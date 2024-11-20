import { PrismaClient } from "@prisma/client";
import { logger } from "@rharkor/logger";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrisma = () => {
  const instance = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
  });
  instance.$on("query", (e) => {
    if (e.duration > 1000) {
      logger.warn(`Prisma query took ${e.duration}ms`, {
        query: e.query,
        params: e.params,
      });
    }
  });
  return instance;
};

export const prisma =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  globalForPrisma.prisma ||
  getPrisma().$extends({
    query: {
      user: {
        async $allOperations({ args, query }) {
          const result = await query(args);
          if (
            !("select" in args) ||
            (args.select &&
              typeof args.select === "object" &&
              "password" in args.select &&
              args.select.password !== true)
          ) {
            if (Array.isArray(result)) {
              result.forEach((r) => {
                if ("password" in r) {
                  delete r.password;
                }
              });
            } else if (
              typeof result === "object" &&
              result &&
              "password" in result
            ) {
              delete result.password;
            }
          }
          return result;
        },
      },
    },
  });

// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
