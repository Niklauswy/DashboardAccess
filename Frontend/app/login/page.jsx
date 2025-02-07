'use client'
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/ui/button';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', { username, password, redirect: false });
    if (res.error) {
      setError('Credenciales inválidas');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sección informativa (oculta en móvil) */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-10">
        <Image 
          src="/cimarron.png" 
          alt="Ilustración de Login" 
          width={300} 
          height={300} 
          className="mb-4"
        />
      </div>

      {/* Sección de Login */}
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Inicia Sesión</h2>
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1">Usuario</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            <Button 
              className="w-full py-2 text-white rounded font-medium transition"
            >
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}