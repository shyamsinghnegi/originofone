"use client";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const upsertMe = useMutation(api.users.upsertMe);

  useEffect(() => {
    if (!isAuthenticated) return;
    upsertMe().catch(console.error);
  }, [isAuthenticated]);

  return null;
}
