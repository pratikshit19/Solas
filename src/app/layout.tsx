import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Solas | Your Private Emotional Operating System",
  description: "A structured emotional growth system providing guided AI wellness coaching, emotional mapping, and personalized therapeutic frameworks.",
  appleWebApp: {
    capable: true,
    title: "Solas OS",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          outfit.variable,
          inter.variable,
          "min-h-screen gradient-bg selection:bg-primary/20"
        )}
      >
        <div className="relative min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
