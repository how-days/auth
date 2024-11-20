"use server";

import { signIn } from "@/lib/auth";
import { signUpSchema } from "@/lib/auth/schemas";
import { prisma } from "@/lib/prisma";
import { saltAndHashPassword } from "@/lib/utils/password";
import { logger } from "@rharkor/logger";
import { redirect } from "next/navigation";

export async function registerUser(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    logger.error("Invalid credentials.", { parsed });
    return { message: "Invalid credentials." };
  }

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: await saltAndHashPassword(parsed.data.password),
    },
  });

  try {
    await signIn("credentials", {
      redirect: false,
      email: parsed.data.email,
      password: parsed.data.password,
    });
  } catch (error) {
    logger.error("Failed to sign in after account creation.", { error });
    return { message: "Failed to sign in after account creation." };
  }

  redirect("/");
}
