import { getSession } from "@/lib/auth/server";
import { Card } from "@nextui-org/card";
import SignOut from "./sign-out";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <Card className="w-full max-w-md p-4">
        <pre>
          Current session object:{" "}
          <code>{JSON.stringify(session, null, 2)}</code>
        </pre>
        <SignOut />
      </Card>
    </main>
  );
}
