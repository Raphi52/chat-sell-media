"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { MessageNotificationProvider } from "@/components/providers/MessageNotificationProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CurrencyProvider>
        <MessageNotificationProvider>
          {children}
        </MessageNotificationProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}
