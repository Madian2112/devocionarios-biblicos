"use client"

import { LandingPage as LandingPageComponent } from "@/components/landing-page";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();

    const handleLoginClick = () => {
        router.push('/login');
    }

    return <LandingPageComponent onLoginClick={handleLoginClick} />
}
