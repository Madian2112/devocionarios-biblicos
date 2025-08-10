'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense, useEffect } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ZoomProvider } from "@/components/zoom-provider";
import { ZoomControls } from "@/components/zoom-controls";
import { AuthProvider } from "@/context/auth-context";
import ProgressBar from "@/components/progress-bar";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dynamic from 'next/dynamic';

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "arial"],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>Devocionales Bíblicos con Notas</title>
        <meta name="description" content="Tu espacio personal para la reflexión y el estudio profundo de la Biblia. Registra devocionales, organiza estudios temáticos y conecta con la Palabra de Dios." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Devocionales" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://devocionales-biblicos.netlify.app/" />
        <meta property="og:title" content="Devocionales Bíblicos con Notas" />
        <meta property="og:description" content="Explora devocionales diarios y estudios bíblicos para tu crecimiento espiritual." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://devocionales-biblicos.netlify.app/" />
        <meta property="twitter:title" content="Devocionales Bíblicos con Notas" />
        <meta property="twitter:description" content="Conecta con la Palabra de Dios cada día" />
        
        {/* Icons and Manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
        
        {/* Preload important resources */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ZoomProvider>
              <Suspense fallback={null}>
                <ProgressBar />
              </Suspense>
              {children}
              <ZoomControls />
              <Toaster />
              {/* Registrar Service Worker */}
            </ZoomProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}