"use client";

import { useRouter } from "next/navigation";
import { AuthenticatorSetup } from "../components/AuthenticatorSetup";

export function SetupClient() {
  const router = useRouter();
  return (
    <AuthenticatorSetup
      onConfirmed={() => {
        router.push("/");
        router.refresh();
      }}
    />
  );
}
