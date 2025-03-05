"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
// Import Image component but also keep regular img as fallback
import Image from "next/image";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { data: session, status } = useSession();
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError("Credenciales inválidas");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Error de login:", error);
      setError("Ocurrió un error al iniciar sesión");
      setIsLoading(false);
    }
  };
  
  // No mostrar nada mientras verificamos la sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  // Solo mostrar el formulario si no está autenticado
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
         
              
              <Image 
                src="/cimarron.png" 
                alt="Logo Cimarron UABC" 
                width={120} 
                height={120}
                className="mx-auto"
         
              />
             
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Acceso al Dashboard UABC
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Inicia sesión con tus credenciales
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#00723F] focus:border-[#00723F] focus:z-10 sm:text-sm"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#00723F] focus:border-[#00723F] focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00723F] hover:bg-[#005c32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00723F] transition-all duration-200 shadow-md"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : "Iniciar sesión"}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">Universidad Autónoma de Baja California</p>
          </div>
        </div>
      </div>
    );
  }
  
  return null; // No mostrar nada si está autenticado (redirigido)
}