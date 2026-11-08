"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { subscribeToOtherSessionChanges } from "@/lib/session-events";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  useEffect(() => {
    const clearSessionData = () => client.clear();
    const unsubscribeOtherTabs = subscribeToOtherSessionChanges(() => {
      client.clear();
      window.location.reload();
    });
    window.addEventListener("tempo:session-changed", clearSessionData);
    return () => {
      window.removeEventListener("tempo:session-changed", clearSessionData);
      unsubscribeOtherTabs();
    };
  }, [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
