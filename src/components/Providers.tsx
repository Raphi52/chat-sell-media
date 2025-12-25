"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </SessionProvider>
  );
}
