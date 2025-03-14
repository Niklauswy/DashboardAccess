import {NextResponse} from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:5000/api/ous', {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.error();
    }
}