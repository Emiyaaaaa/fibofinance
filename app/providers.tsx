"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  locale: string;
  messages: AbstractIntlMessages;
}

export function Providers({ children, themeProps, locale, messages }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="bottom-center" toastProps={{ timeout: 1000 }} />
      <NextThemesProvider attribute="class" defaultTheme="dark" {...themeProps}>
        <NextIntlClientProvider
          getMessageFallback={({ namespace, key }) => {
            return key;
          }}
          locale={locale}
          messages={messages}
          onError={() => {}}
        >
          {children}
        </NextIntlClientProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
