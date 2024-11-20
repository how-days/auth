import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import github from "next-auth/providers/github";
import { env } from "../env";
import { logger } from "@rharkor/logger";
import { credentials } from "./credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [github, credentials],
  logger: {
    warn(code) {
      logger.warn("warn", code);
    },
    error(error) {
      const { name } = error;
      if (
        ["CredentialsSignin", "JWTSessionError", "CallbackRouteError"].includes(
          name
        )
      )
        return;
      logger.error("Next auth error");
      console.error(error);
    },
  },
});
