import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomAuthProvider } from '@/contexts/CustomAuthContext';
import Navigation from '@/components/Navigation';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Griya Jannatin Leyangan",
  description: "Aplikasi manajemen perumahan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CustomAuthProvider>
            <Navigation />
            <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
              {children}
            </main>
            <Toaster />
          </CustomAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
