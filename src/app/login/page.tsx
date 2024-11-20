"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { loginUser, loginWithGitHub } from "./action";
import { useActionState } from "react";

const initialState = {
  message: "",
};

export default function LoginPage() {
  const [credentialsState, credentialsFormAction] = useActionState(
    loginUser,
    initialState
  );
  const [, githubFormAction] = useActionState(loginWithGitHub, undefined);

  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Login</h1>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <form action={credentialsFormAction} className="flex flex-col gap-2">
            <Input name="email" label="Email" type="email" />
            <Input name="password" label="Password" type="password" />
            <p aria-live="polite">{credentialsState?.message}</p>
            <Button type="submit" color="primary" className="mt-2">
              Sign In
            </Button>
          </form>
          <form action={githubFormAction}>
            <Button type="submit">Signin with GitHub</Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
