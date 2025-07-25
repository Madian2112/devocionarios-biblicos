"use client"

import { LoginPage as LoginPageComponent } from "@/components/login-page";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSuccess = () => {
        // Guardar estado de autenticación
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/home');
    }

    const handleBackClick = () => {
        router.push('/');
    }

    return <LoginPageComponent onLoginSuccess={handleLoginSuccess} onBackClick={handleBackClick} />
}