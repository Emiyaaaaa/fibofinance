import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { getLocale, getMessages } from "next-intl/server";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import { syncDatabase } from "@/utils/syncDatabase";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await syncDatabase();

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale}>
      <head />
      <body className={clsx("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
