import { auth } from ".";

import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return session;
}
