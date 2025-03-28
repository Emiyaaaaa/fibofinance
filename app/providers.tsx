"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="bottom-center" toastProps={{ timeout: 1000 }} />
      <NextThemesProvider attribute="class" defaultTheme="dark" {...themeProps}>
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
