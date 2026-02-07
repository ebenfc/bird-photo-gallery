"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SkinProvider } from "@/contexts/SkinContext";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-mode"
      defaultTheme="system"
      themes={["light", "dark"]}
      enableSystem
      disableTransitionOnChange
    >
      <SkinProvider>
        {children}
      </SkinProvider>
    </NextThemesProvider>
  );
}
