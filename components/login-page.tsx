"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientCard } from "@/components/ui/gradient-card";
import { Lock, LogIn, User, AlertCircle, UserPlus } from "lucide-react";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoginPageProps {
  defaultMode?: 'login' | 'signup';
}

export function LoginPage({ defaultMode = 'login' }: LoginPageProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const router = useRouter();

  const handleAuthAction = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/home');
    } catch (err: any) {
      const error = err;
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No se encontró un usuario con ese correo.");
          break;
        case 'auth/wrong-password':
          setError("Contraseña incorrecta. Inténtalo de nuevo.");
          break;
        case 'auth/email-already-in-use':
          setError("Este correo electrónico ya está en uso.");
          break;
        case 'auth/weak-password':
          setError("La contraseña debe tener al menos 6 caracteres.");
          break;
        default:
          setError("Ocurrió un error. Por favor, inténtalo de nuevo.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Por favor, escribe tu correo electrónico para restablecer tu contraseña.");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("¡Correo enviado! Revisa tu bandeja de entrada (y la carpeta de spam).");
    } catch (err: any) {
      const error = err;
      if (error.code === 'auth/user-not-found') {
        setError("No se encontró ninguna cuenta con ese correo electrónico.");
      } else {
        setError("Ocurrió un error al enviar el correo. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              {isSignUp ? <UserPlus className="h-8 w-8 text-white" /> : <Lock className="h-8 w-8 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-white">{isSignUp ? "Crear Cuenta" : "Acceso Privado"}</h1>
            <p className="text-gray-400">{isSignUp ? "Crea una cuenta para guardar tus devocionales." : "Ingresa tus credenciales para continuar."}</p>
        </div>
        
        <GradientCard>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                 <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="pl-10 bg-[#2a2a2a]/50 border-gray-700"
                  />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuthAction()}
                    placeholder="••••••••"
                    className="pl-10 bg-[#2a2a2a]/50 border-gray-700"
                  />
               </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white h-auto p-0 text-sm"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5"/>
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5"/>
                <p className="text-sm">{success}</p>
              </div>
            )}

            <Button onClick={handleAuthAction} disabled={loading} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg h-12">
              {loading ? <LoadingSpinner size="sm" /> : (isSignUp ? <><UserPlus className="h-5 w-5 mr-2"/>Registrarse</> : <><LogIn className="h-5 w-5 mr-2"/>Iniciar Sesión</>)}
            </Button>
          </div>
        </GradientCard>
        
        <div className="text-center mt-8">
            <Button variant="link" onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }} className="text-gray-400 hover:text-white">
                {isSignUp ? "¿Ya tienes una cuenta? Inicia Sesión" : "¿No tienes una cuenta? Regístrate"}
            </Button>
        </div>
      </div>
    </div>
  );
} 