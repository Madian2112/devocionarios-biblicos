import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ZoomProvider } from "@/components/zoom-provider";
import { ZoomControls } from "@/components/zoom-controls";
import {AuthProvider} from "@/context/auth-context"
import ProgressBar from "@/components/progress-bar";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dynamic from 'next/dynamic';

// 🚀 Optimización extrema de fuentes - Solo lo esencial
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // ✅ Swap inmediato para mejor performance
  variable: "--font-inter",
  preload: true, // ✅ Preload crítico
  fallback: ["system-ui", "arial"], // ✅ Fallbacks optimizados
});

export const metadata: Metadata = {
  title: "Devocionales Bíblicos con Notas",
  description: "Tu espacio personal para la reflexión y el estudio profundo de la Biblia. Registra devocionales, organiza estudios temáticos y conecta con la Palabra de Dios.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://devocionales-biblicos.netlify.app/"), 
  openGraph: {
    title: "Devocionales Bíblicos con Notas",
    description: "Explora devocionales diarios y estudios bíblicos para tu crecimiento espiritual.",
    type: "website",
    url: "https://devocionales-biblicos.netlify.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devocionales Bíblicos con Notas",
    description: "Conecta con la Palabra de Dios cada día",
  },
};

// const AuthProvider = dynamic(
//   () => import('@/context/auth-context').then((mod) => mod.AuthProvider),
//   {
//     ssr: false, // Desactiva SSR para este componente
//     loading: () => (
//       <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
//         <div className="text-center">
//           <LoadingSpinner size="lg" />
//           <p className="text-gray-400 text-sm animate-pulse mt-4">
//             Cargando autenticación...
//           </p>
//         </div>
//       </div>
//     ),
//   }
// );

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 🚀 Critical CSS preload */}
        <link 
          rel="preload" 
          href="/_next/static/css/app/layout.css" 
          as="style" 
        />
        
        {/* 🚀 DNS prefetch optimizado - Solo lo crítico */}
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        
        {/* 🚀 Viewport optimizado - SIN ZOOM */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
        
        {/* Meta tags PWA esenciales */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Devocionales" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Icons optimizados */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* 🚀 Providers optimizados - Solo los esenciales */}
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ZoomProvider>
              {/* 🚀 ProgressBar con Suspense para no bloquear */}
              <Suspense fallback={null}>
                <ProgressBar />
              </Suspense>
              
              {/* 🚀 Contenido principal */}
              {children}
              
              {/* 🚀 Componentes no críticos al final */}
              <ZoomControls />
              <Toaster />
            </ZoomProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}