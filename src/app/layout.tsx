import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Youniq RH | Portal do Cliente",
  description: "Portal multi-servicos de RH da Youniq: projetos, recrutamento, CRM e mais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
