'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
      <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-10">
        <Image 
          src="/public/cimarron.png"
          alt="Ilustración de Login"
          width={300}
          height={300}
        />
      </div>
      <div className="flex flex-1 items-center justify-center p-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Inicia Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input 
                  id="username"
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Iniciar Sesión</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}