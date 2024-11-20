"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { registerUser } from "./action";
import { useActionState } from "react";

const initialState = {
  message: "",
};

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, initialState);

  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Register</h1>
        </CardHeader>
        <CardBody>
          <form action={formAction} className="flex flex-col gap-2">
            <Input name="email" label="Email" type="email" />
            <Input name="password" label="Password" type="password" />
            <p aria-live="polite">{state?.message}</p>
            <Button type="submit" color="primary" className="mt-2">
              Create Account
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
