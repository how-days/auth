"use server";

import { signIn } from "@/lib/auth";
import { signInSchema } from "@/lib/auth/schemas";
import { logger } from "@rharkor/logger";
import { redirect } from "next/navigation";

export async function loginUser(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    logger.error("Invalid credentials.", { parsed });
    return { message: "Invalid credentials." };
  }

  try {
    await signIn("credentials", {
      redirect: false,
      email: parsed.data.email,
      password: parsed.data.password,
    });
  } catch (error) {
    logger.error("Failed to sign in.", { error });
    return { message: "Failed to sign in." };
  }

  redirect("/");
}

export async function loginWithGitHub() {
  await signIn("github", { redirectTo: "/" });
}
