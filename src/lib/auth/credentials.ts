import credentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "@/lib/utils/password";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "./schemas";

export const credentials = credentialsProvider({
  credentials: {
    email: {},
    password: {},
  },
  authorize: async (credentials) => {
    const parsed = signInSchema.safeParse(credentials);
    if (!parsed.success) {
      throw new Error("Invalid credentials.");
    }

    // logic to verify if the user exists
    let user = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    // Compare the password hash
    if (user) {
      if (!user.password) {
        throw new Error("User was created with an external provider.");
      }
      if (!(await comparePassword(parsed.data.password, user.password))) {
        user = null;
      }
    }

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    return user;
  },
});
