import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientCard } from "@/components/ui/gradient-card";
import { Lock, LogIn, User, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackClick: () => void;
}

export function LoginPage({ onLoginSuccess, onBackClick }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError(""); // Clear previous errors
    if (username === "admin" && password === "admin") {
      onLoginSuccess();
    } else {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Acceso Privado</h1>
            <p className="text-gray-400">Ingresa tus credenciales para continuar.</p>
        </div>
        
        <GradientCard>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                 <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
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
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="admin"
                    className="pl-10 bg-[#2a2a2a]/50 border-gray-700"
                  />
               </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5"/>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button onClick={handleLogin} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg h-12">
              <LogIn className="h-5 w-5 mr-2"/>
              Iniciar Sesión
            </Button>
          </div>
        </GradientCard>
        
        <div className="text-center mt-8">
            <Button variant="link" onClick={onBackClick} className="text-gray-400 hover:text-white">
                Volver a la página principal
            </Button>
        </div>
      </div>
    </div>
  );
} 