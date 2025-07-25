import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { ZoomProvider } from "@/components/zoom-provider";
import { ZoomControls } from "@/components/zoom-controls";
import ProgressBar from "@/components/progress-bar";
import { CacheDebug } from "@/components/cache-debug";
import { Toaster } from "@/components/ui/toaster";

// �� Optimización avanzada de fuentes
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // ✅ Swap inmediato para mejor performance
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  preload: true, // ✅ Preload para carga más rápida
  fallback: ["system-ui", "arial"], // ✅ Fallbacks optimizados
  adjustFontFallback: true, // ✅ Ajuste automático de fallbacks
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Devocionales Bíblicos con Notas - Notas",
  description: "Tu espacio personal para la reflexión y el estudio profundo de la Biblia. Registra devocionales, organiza estudios temáticos y conecta con la Palabra de Dios.",
  metadataBase: new URL("https://devocionales-biblicos.netlify.app/"), 
  openGraph: {
    title: "Devocionales Bíblicos con Notas",
    description: "Explora devocionales diarios y estudios bíblicos para tu crecimiento espiritual.",
    type: "website",
    url: "https://devocionales-biblicos.netlify.app/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Devocionales Bíblicos con Notas",
      },
    ],
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devocionales Bíblicos con Notas",
    description: "Conecta con la Palabra de Dios cada día",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://devocionales-biblicos-rv.netlify.app/", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 🚀 Preload de fuentes para carga inmediata */}
        <link 
          rel="preload" 
          href="/_next/static/css/app/layout.css" 
          as="style" 
        />
        
        {/* 🚀 DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://firebase.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        
        {/* 🚀 Preconnect optimizado */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 🚀 Meta tags de performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        
        {/* Meta tags para iOS optimizados */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Devocionales" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>

        {/* Favicon optimizado para navegadores */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="manifest" href="/manifest.json" />
        
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ZoomProvider>
              <Suspense>
                <ProgressBar />
              </Suspense>
              {children}
              <ZoomControls />
              {/* 🔧 Cache Debug - Solo en development */}
              {process.env.NODE_ENV === 'development' && <CacheDebug />}
              {/* 🔔 Sistema de notificaciones toast */}
              <Toaster />
            </ZoomProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}