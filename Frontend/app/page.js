'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import './globals.css';
import ErrorServer from '@/components/ErrorServer';
import NoData from '@/components/NoData';

async function getUsers() {
    try {
        const res = await fetch("http://localhost:5000/api/users", {
            cache: 'no-store',
        });
        if (!res.ok) {
            throw new Error(`Error al obtener usuarios: ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error('Error al conectar con la API:', error);
        // Regresa null (o un arreglo vacío) para indicar que no se pudo obtener la data
        return null;
    }
}

export default async function Page() {
    const [reload, setReload] = useState(false);

    const handleRetry = () => {
        setReload(!reload);
    };

    // Se intenta obtener los usuarios
    const users = await getUsers();

    // Si no se obtuvieron datos, muestra mensaje de no datos
    if (users && users.length === 0) {
        return <NoData onReload={handleRetry} />;
    }

    // Si ocurrió un error al obtener los usuarios, muestra mensaje de error del servidor
    if (!users) {
        return <ErrorServer message="El servidor parece no está respondiendo correctamente. Por favor, inténtalo más tarde." onRetry={handleRetry} />;
    }

    return (
        <div className="flex flex-col items-center bg-gray-100 min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-6">Lista de usuarios</h1>
            <Image
                src="https://via.placeholder.com/150"
                alt="Placeholder"
                width={150}
                height={150}
                className="mb-4 rounded-full"
            />
            <ul className="space-y-2">
                {users.map((user, index) => (
                    <li key={index} className="bg-white p-3 rounded shadow">
                        {JSON.stringify(user)}
                    </li>
                ))}
            </ul>
        </div>
    );
};