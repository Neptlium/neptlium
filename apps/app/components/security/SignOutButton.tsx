"use client";

import { useTransition } from "react";
import { Button } from "@netlium/ui";
import { signOutAction } from "./actions";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleSignOut} loading={isPending}>
      Sign Out
    </Button>
  );
}
