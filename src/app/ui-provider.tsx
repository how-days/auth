import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";

export default function UIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
