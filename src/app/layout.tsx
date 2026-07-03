import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/feedback/toaster";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://correhub.app"),
  title: {
    default: "CorreHub",
    template: "%s | CorreHub"
  },
  description: "Plataforma para conectar grupos, treinos, eventos e parceiros da corrida de rua em todo o Brasil.",
  openGraph: {
    title: "CorreHub",
    description: "Todos os grupos de corrida da sua cidade em um so lugar.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
