import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { getLocale, getMessages } from "next-intl/server";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import { syncDatabase } from "@/utils/syncDatabase";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Fibofinance",
    template: `%s - Fibofinance`,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @font-face {
              font-family: 'Rajdhani';
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/rajdhani/v16/LDI2apCSOBg7S-QT7pbYF_OreefkkbIx.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
          `,
          }}
        />
      </head>
      <body className={clsx("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Providers locale={locale} messages={messages}>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
