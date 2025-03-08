import { NextResponse } from 'next/server';

export async function GET(request) {
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

        const data = await response.json();

        if (response.ok) {
            return NextResponse.json(data, { status: 201 });
        } else {
            return NextResponse.json(data, { status: response.status || 500 });
        }
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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

export async function DELETE(request) {
    try {
        const { username } = await request.json();
        if (!username) {
            return NextResponse.json({ error: 'Nombre de usuario requerido' }, { status: 400 });
        }

        console.log(`Sending delete request for user: ${username}`);

        // Use POST instead of DELETE to avoid method compatibility issues
        const response = await fetch('http://localhost:5000/api/users/delete', {
            method: 'POST', // Changed from DELETE to POST
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        // First try to get the response as text
        const responseText = await response.text();
        console.log(`Backend response: ${responseText}`);
        
        let data;
        try {
            // Try to parse as JSON
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            // If not JSON, return the text with appropriate status
            return NextResponse.json({ 
                error: 'Invalid response from server', 
                details: responseText 
            }, { status: 500 });
        }

        if (response.ok) {
            return NextResponse.json(data, { status: 200 });
        } else {
            console.error('Backend error deleting user:', data.error || data);
            return NextResponse.json(data, { status: response.status || 500 });
        }
    } catch (error) {
        console.error('Error in DELETE /api/users:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}