"use client"

import { LandingPage as LandingPageComponent } from "@/components/landing-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/context/auth-context";

export default function LandingPage() {
    const router = useRouter();
    const { user, loading } = useAuthContext();

    // 🚀 Redirigir usuarios autenticados directamente a /home
    useEffect(() => {
        if (!loading && user) {
            router.replace('/home');
        }
    }, [user, loading, router]);

    const handleLoginClick = () => {
        router.push('/login');
    }

    // 🚀 Nueva función para ir directo al registro
    const handleSignupClick = () => {
        router.push('/login?mode=signup');
    }

    // Mostrar loading mientras verifica autenticación para evitar parpadeo
    if (loading) {
        return null;
    }

    // Solo mostrar landing page si no hay usuario autenticado
    if (!user) {
        return <LandingPageComponent onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
    }

    return null; // No debería llegar aquí, pero por seguridad
}
