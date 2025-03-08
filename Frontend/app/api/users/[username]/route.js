import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(request, { params }) {
  const { username } = params;
  // Could implement getting a specific user if needed
  return NextResponse.json({ username });
}

export async function PUT(request, { params }) {
  try {
    const { username } = params;
    const userData = await request.json();

    const response = await fetch('http://localhost:5000/api/users/edit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, username }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(data, { status: response.status || 500 });
    }
  } catch (error) {
    console.error('Error in PUT /api/users/[username]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { username } = params;
    if (!username) {
      return NextResponse.json({ error: 'Nombre de usuario requerido' }, { status: 400 });
    }

    // Call the backend API endpoint instead of executing the script directly
    const response = await fetch(`http://localhost:5000/api/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from backend:', errorText);
      return NextResponse.json(
        { error: 'Error al eliminar usuario', details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: `Usuario '${username}' eliminado correctamente`,
      details: data
    });
  } catch (error) {
    console.error('Error in DELETE /api/users/[username]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
