'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense, useEffect } from "react"; // Añade useEffect
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

// Componente dinámico para evitar renderizado en el servidor
const ServiceWorkerRegistration = dynamic(() => Promise.resolve(() => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Service Worker registrado:', registration);
          },
          (error) => {
            console.error('Error al registrar el Service Worker:', error);
          }
        );
      });
    }
  }, []);
  return null;
}), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
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
              <ServiceWorkerRegistration />
            </ZoomProvider>
          </ThemeProvider>
        </AuthProvider>
        </body>
        </html>
  );
}