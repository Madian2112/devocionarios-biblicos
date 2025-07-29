"use client"

import { LandingPage as LandingPageComponent } from "@/components/landing-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/context/auth-context";
import { enhancedIndexedDBCache } from '@/lib/cache/indexdDB-avanzado';

export default function LandingPage() {
    const router = useRouter();
    const { user, loading } = useAuthContext();

    useEffect(() => {
        enhancedIndexedDBCache.init();
    }, []);

    // 🚀 Redirección instantánea para usuarios autenticados
    useEffect(() => {
        if (user && !loading) {
            // Usar replace para navegación limpia
            router.replace('/home');
        }
    }, [user, loading, router]);

    const handleLoginClick = () => {
        router.push('/login');
    }

    const handleSignupClick = () => {
        router.push('/login?mode=signup');
    }

    // 🚀 Si hay usuario, no renderizar nada (redirección en curso)
    if (user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <p className="text-gray-400 text-xs">Redirigiendo...</p>
                </div>
            </div>
        );
    }

    // 🚀 Renderizar landing page inmediatamente para usuarios no autenticados
    return <LandingPageComponent onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
}