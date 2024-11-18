import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const res = await fetch('http://localhost:5000/api/groups', {
            cache: 'no-store',
        });
        const data = await res.json();
        // Asegurar que cada grupo tiene un campo 'type' que sea 'security' o 'distribution'
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.error();
    }
}