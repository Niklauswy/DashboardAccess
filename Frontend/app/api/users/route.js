import {NextResponse} from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:5000/api/users', {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.error();
    }
}

export async function POST(request) {
    try {
        const userData = await request.json();

        const response = await fetch('http://localhost:5000/api/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        // Siempre intentamos leer como JSON primero
        let data;
        try {
            data = await response.json();
        } catch (e) {
            // Si no es JSON, obtenemos el texto
            const text = await response.text();
            data = { error: text };
        }

        // Si es una respuesta exitosa
        if (response.ok) {
            return NextResponse.json(data, { status: 201 });
        } 
        // Si es un error, pero tenemos datos json
        else {
            // Mantener el mismo formato y status code del backend
            return NextResponse.json(data, { 
                status: response.status || 400 
            });
        }
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        return NextResponse.json({ 
            error: error.message || 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const userData = await request.json();

        const response = await fetch('http://localhost:5000/api/users/edit', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            return NextResponse.json(data, { status: 200 });
        } else {
            return NextResponse.json(data, { status: response.status || 500 });
        }
    } catch (error) {
        console.error('Error in PUT /api/users:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// DELETE method removed since it's now handled by the dynamic route