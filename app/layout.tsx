import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use next/font for deterministic Inter rendering across environments.
import type { ReactNode } from "react";
import "./globals.css";
import "katex/dist/katex.min.css"; // Load KaTeX styles so rendered math is displayed correctly.

const inter = Inter({ subsets: ["latin"], display: "swap" }); // Apply Inter site-wide with consistent loading behavior.

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
    <html lang="en" className={inter.className}> {/* Set font on <html> to avoid dev/preview/prod mismatch. */}
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-white text-zinc-900 antialiased">
        <div className="min-h-screen flex flex-col">{children}</div>
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
            <a href="mailto:ryandharma04@gmail.com" className="px-2 py-1 hover:text-blue-600">Email</a>
            <a href="https://www.linkedin.com/in/ryandharma/" target="_blank" rel="noopener noreferrer" className="px-2 py-1 hover:text-blue-600">LinkedIn</a>
          </div>
        </div>
      </body>
    </html>
  );
}
