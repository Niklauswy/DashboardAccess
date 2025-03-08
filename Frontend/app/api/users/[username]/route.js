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

    console.log(`Frontend: Deleting user ${username}`);
    
    // Call the backend API endpoint
    const response = await fetch(`http://localhost:5000/api/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    
    // Handle non-JSON responses from backend
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Non-JSON response: ${text}`);
      return NextResponse.json(
        { error: 'Respuesta no válida del servidor', details: text }, 
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('Error from backend:', data);
      return NextResponse.json(
        { error: data.error || 'Error al eliminar usuario', details: data },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: data.message || `Usuario '${username}' eliminado correctamente`,
      details: data
    });
  } catch (error) {
    console.error('Exception in DELETE /api/users/[username]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error.message 
    }, { status: 500 });
  }
}
