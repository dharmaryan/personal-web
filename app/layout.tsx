import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ryan Dharma – RevOps and Finance",
  description:
    "Revenue Operations professional with experience across Bank of America, I Squared Capital, and Omni.",
  metadataBase: new URL("https://ryandharma.com"),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Ryan Dharma – RevOps and Finance",
    description:
      "Revenue Operations professional with experience across Bank of America, I Squared Capital, and Omni.",
    url: "https://ryandharma.com",
    siteName: "Ryan Dharma",
    locale: "en_US",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Ryan Dharma – RevOps and Finance",
    description:
      "Revenue Operations professional with experience across Bank of America, I Squared Capital, and Omni.",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`${inter.variable} bg-white text-slate-900 antialiased`}>
        <div className="page-transition min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
