import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:5000/api/stats', {
            cache: 'no-store',
        });
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas del dashboard' }, 
            { status: 500 }
        );
    }
}
