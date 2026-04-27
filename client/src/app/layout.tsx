import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import AppHeader from "@/components/layout/AppHeader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Women's Fashion & Beauty",
  description: "E-commerce platform for fashion and beauty products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
