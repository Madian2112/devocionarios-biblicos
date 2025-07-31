"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientCard } from "@/components/ui/gradient-card";
import { Lock, LogIn, User, AlertCircle, UserPlus, Info } from "lucide-react";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { notificationSystem } from "@/lib/hybrid-notification-system";
import { toast } from "@/hooks/use-toast";
import { useDisableMobileZoom } from '@/hooks/use-disable-mobile-zoom';

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
  useDisableMobileZoom();

  const handleAuthAction = async () => {
    // Validación de campos vacíos
    if (!email.trim()) {
      toast({
        title: "⚠️ Campo requerido",
        description: "Por favor ingresa tu email",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "⚠️ Campo requerido", 
        description: "Por favor ingresa tu contraseña",
        variant: "destructive",
      });
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let userCredential;
      
      if (isSignUp) {
        // 🎉 Crear nuevo usuario
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 🎉 SOLO PARA NUEVOS USUARIOS: Configurar notificaciones de bienvenida
        if (userCredential.user) {
          const userName = email.split('@')[0];
          
          
          // Configurar notificaciones nativas (no bloquear el flujo)
          notificationSystem.setupWelcomeNotifications(userName).catch((error: any) => {
            console.warn('⚠️ No se pudieron configurar las notificaciones:', error);
          });
        }
        
        setSuccess("¡Cuenta creada exitosamente! Bienvenido 🎉");
      } else {
        // 🔑 Iniciar sesión
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Inicio sesion: ', userCredential);

        setSuccess("¡Sesión iniciada exitosamente! 🚀");
      }

      // Redirigir al home
      router.push('/home');
      
    } catch (error: any) {
      console.error('Error en autenticación:', error);
      
      let errorMessage = "Ha ocurrido un error inesperado";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No existe una cuenta con este email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Contraseña incorrecta";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "Ya existe una cuenta con este email";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña debe tener al menos 6 caracteres";
          break;
        case 'auth/invalid-email':
          errorMessage = "Email inválido";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos. Intenta más tarde";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Correo o contraseña inválidos. Intentelo de nuevo.";
          break;
        default:
          errorMessage = error.message || "Error de autenticación";
      }
      
      console.log('Error de autenticación:', error.code);

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast({
        title: "⚠️ Email requerido",
        description: "Ingresa tu email para enviar el enlace de recuperación",
        variant: "destructive",
      });
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 🔐 Enviar email de reset via Firebase (nativo)
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: false
      });

      setSuccess("✅ Email de recuperación enviado. Revisa tu bandeja de entrada.");
      
    } catch (error: any) {
      console.error('Error en reset password:', error);
      
      let errorMessage = "Error enviando email de recuperación";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No existe una cuenta con este email";
          break;
        case 'auth/invalid-email':
          errorMessage = "Email inválido";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos. Intenta más tarde";
          break;
        default:
          errorMessage = error.message || "Error enviando email";
      }
      
      setError(errorMessage);
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
<div className="text-right flex items-center justify-end gap-2">
  <Button
    variant="link"
    className="text-gray-400 hover:text-white h-auto p-0 text-sm"
    onClick={() => {}}
    disabled={loading}
  >
    ¿Olvidaste tu contraseña? 
  </Button>
  
  {/* Indicador Beta con Tooltip */}
  <div className="relative group">
    <span className="text-xs bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
      INFO
      <Info className="h-3 w-3" />
    </span>
    
    {/* Tooltip */}
    <div className="absolute hidden group-hover:block z-10 w-58 bg-gray-800 text-white text-sm p-2 rounded-md shadow-lg right-0 mt-1">
      Para reestablecer tu contraseña, comuniquese con el correo devocionales.biblicos.rv@gmail.com
    </div>
  </div>
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