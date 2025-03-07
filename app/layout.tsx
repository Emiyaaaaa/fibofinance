import "@/styles/globals.css";
import "github-markdown-css/github-markdown.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

import { fontSans } from "@/config/fonts";
import { createTableIfNotExists } from "@/utils/updateDatabase";

export const metadata: Metadata = {
  title: {
    default: "Fibofinance",
    template: `%s - Fibofinance`,
  },
  description: "AI-Powered Asset Allocation with the Golden Ratio",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await createTableIfNotExists();

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale}>
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
