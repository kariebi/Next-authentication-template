import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StoreProvider from "@/utils/providers/StoreProvider";
import "./globals.css";
import { ToasterProvider } from "@/utils/providers/ToasterProvider";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NextJS Auth Template",
    template: "%s | NextJS Authentication Template by Kariebi",
  },
  description: "A NextJS Auth Template made without Next-Auth using PrismaORM and MongoDB.",
  applicationName: "NextJS Auth Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToasterProvider />
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
