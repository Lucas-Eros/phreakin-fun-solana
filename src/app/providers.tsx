"use client";

import { type ReactNode } from "react";

import { SplashScreenProvider } from "@/contexts/SplashScreenContext";
import { SolanaProvider } from "@/contexts/SolanaProvider";
import { AppLoader } from "@/components/ui/AppLoader";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SplashScreenProvider>
      <SolanaProvider>
        <AppLoader>{children}</AppLoader>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#1F2937",
              color: "#F9FAFB",
              border: "1px solid #374151",
            },
          }}
        />
      </SolanaProvider>
    </SplashScreenProvider>
  );
}
