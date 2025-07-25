"use client"

import { LoginPage as LoginPageComponent } from "@/components/login-page";
import { useAuthContext } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function LoginPageContent() {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 🚀 Detectar si debe abrir en modo registro
    const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

    useEffect(() => {
        // Si no está cargando y ya hay un usuario, redirigir al home.
        if (!loading && user) {
            router.replace('/home');
        }
    }, [user, loading, router]);

    // No mostrar nada mientras se verifica si ya está logueado,
    // para evitar un parpadeo de la página de login.
    if (loading || user) {
        return null; 
    }

    return <LoginPageComponent defaultMode={mode} />;
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}