import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const res = await fetch('http://localhost:5000/api/ous', {
            cache: 'no-store',
        });
        const data = await res.json();
        // Asegurar que los datos tienen una estructura jerárquica
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.error();
    }
}