import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const res = await fetch('http://localhost:5000/api/computers', {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching computers:', error);
        return NextResponse.json(
            { error: 'Error al obtener datos de computadoras' }, 
            { status: 500 }
        );
    }
}