import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/feedback/toaster";
import { AppProviders } from "@/components/providers/app-providers";
import { JsonLd } from "@/components/seo/json-ld";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://correhub.app"),
  title: {
    default: "CorreHub — Sua comunidade de corrida de rua",
    template: "%s | CorreHub",
  },
  description:
    "Descubra grupos de corrida, eventos, treinos e parceiros perto de você. CorreHub conecta corredores, líderes e negócios locais em uma plataforma premium.",
  keywords: [
    "corrida de rua",
    "grupos de corrida",
    "running",
    "corredores",
    "treinos",
    "eventos de corrida",
    "São Lourenço da Mata",
    "comunidade de corrida",
  ],
  authors: [{ name: "CorreHub" }],
  creator: "CorreHub",
  publisher: "CorreHub",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CorreHub",
    title: "CorreHub — Sua comunidade de corrida de rua",
    description:
      "Todos os grupos de corrida da sua cidade em um só lugar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CorreHub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CorreHub — Sua comunidade de corrida de rua",
    description:
      "Todos os grupos de corrida da sua cidade em um só lugar.",
    images: ["/og-image.png"],
    creator: "@correhub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  manifest: "/manifest",
  appleWebApp: {
    capable: true,
    title: "CorreHub",
    statusBarStyle: "default",
  },
  applicationName: "CorreHub",
  category: "sports",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${inter.className}`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
        <JsonLd />
      </body>
    </html>
  );
}
