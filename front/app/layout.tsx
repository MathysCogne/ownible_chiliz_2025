import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers'
import { MainLayout } from "@/components/main-layout";
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ownible - RWA on Chiliz",
  description: "Tokenize and trade real-world assets on the Chiliz blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
            <SidebarProvider>
                <MainLayout>
                    {children}
                </MainLayout>
            </SidebarProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
