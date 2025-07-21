import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider";
import { ZoomProvider } from "@/components/zoom-provider";
import { ZoomControls } from "@/components/zoom-controls";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ZoomProvider>
            {children}
            <ZoomControls />
          </ZoomProvider>
        </ThemeProvider>
      </body>
  );
}
