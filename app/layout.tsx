import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ProgressBar from "@/components/progress-bar";

// Optimización de fuentes
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Devocionales Bíblicos - Reflexiones Diarias y Estudios Cristianos",
  description: "Tu espacio personal para la reflexión y el estudio profundo de la Biblia. Registra devocionales, organiza estudios temáticos y conecta con la Palabra de Dios.",
  metadataBase: new URL("https://devocionales-biblicos.netlify.app/"), 
  openGraph: {
    title: "Devocionales Bíblicos - Tiempo con Dios",
    description: "Explora devocionales diarios y estudios bíblicos para tu crecimiento espiritual.",
    type: "website",
    url: "https://devocionales-biblicos.netlify.app/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Devocionales Bíblicos",
      },
    ],
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devocionales Bíblicos",
    description: "Conecta con la Palabra de Dios cada día",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://devocionales-biblicos.netlify.app/", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Meta tags para iOS */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="Devocionales" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>

      {/* Favicon para navegadores */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/icons/icon-32x32.png" type="image/png" sizes="32x32" />
      <link rel="manifest" href="/manifest.json" />

      {/* Color de tema para navegadores */}
      <meta name="theme-color" content="#1E40AF" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#0F172A" media="(prefers-color-scheme: dark)" />
    </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense>
            <ProgressBar />
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}