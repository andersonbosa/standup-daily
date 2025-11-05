import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { WebVitals } from '@/components/WebVitals';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Timer - Organize suas Dailies com Eficiência",
  description: "Aplicação web para facilitar reuniões diárias (Daily Stand-ups) de times de tecnologia, tornando o processo mais organizado, objetivo e divertido.",
  keywords: ["daily", "standup", "timer", "scrum", "agile", "reunião", "time", "gestão", "daily standup", "sprint", "equipe"],
  authors: [{ name: "Daily Timer Team" }],
  openGraph: {
    title: "Daily Timer - Organize suas Dailies com Eficiência",
    description: "Aplicação web para facilitar reuniões diárias (Daily Stand-ups) de times de tecnologia.",
    type: "website",
    locale: "pt_BR",
    alternateLocale: ["en_US", "es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Timer",
    description: "Organize suas Daily Stand-ups com eficiência",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          {children}
          <Toaster />
          <WebVitals />
          <Analytics />
          <SpeedInsights />
        </Provider>
      </body>
    </html>
  );
}
