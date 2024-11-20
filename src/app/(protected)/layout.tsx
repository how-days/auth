import { getSession } from "@/lib/auth/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getSession();

  return children;
}
