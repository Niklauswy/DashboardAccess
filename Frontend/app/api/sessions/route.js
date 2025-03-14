import {NextResponse} from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:5000/api/sessions', {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching logs from external API:', error);
        return NextResponse.error();
    }
}