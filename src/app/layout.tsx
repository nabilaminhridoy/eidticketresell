import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import PerformancePatch from "@/components/PerformancePatch";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eid Ticket Resell - Buy & Sell Tickets Safely",
  description: "The most trusted marketplace for Bus, Train, Flight & Launch tickets in Bangladesh",
  keywords: ["Eid Ticket", "Bus Ticket", "Train Ticket", "Flight Ticket", "Launch Ticket", "Bangladesh", "Ticket Resell"],
  authors: [{ name: "Eid Ticket Resell" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Eid Ticket Resell - Buy & Sell Tickets Safely",
    description: "The most trusted marketplace for Bus, Train, Flight & Launch tickets in Bangladesh",
    siteName: "Eid Ticket Resell",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <PerformancePatch />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
