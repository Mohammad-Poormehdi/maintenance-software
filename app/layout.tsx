import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/sidebar/SidebarContext";
import { SidebarWrapper } from "@/components/sidebar/SidebarWrapper";
import localFont from 'next/font/local'
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Toaster } from 'sonner'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Maintenance and Inventory Management System",
  description: "A comprehensive solution for maintenance and inventory management",
};

const iranYekan = localFont({
  src: [
    {
      path: '../public/fonts/IRANYekanXFaNum-Regular.ttf',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRANYekanX-Regular.ttf',
      style: 'normal',
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${iranYekan.className} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
              <SidebarWrapper />
              <main className="flex-1 overflow-auto p-4">
                <div className="md:hidden">
                  <Sidebar />
                </div>
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
