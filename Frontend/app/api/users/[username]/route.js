import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { username } = params;
  // Could implement getting a specific user if needed
  return NextResponse.json({ username });
}

export async function PUT(request, { params }) {
  try {
    const { username } = params;
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Nombre de usuario inválido' }, { status: 400 });
    }
    
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
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Nombre de usuario inválido' }, { status: 400 });
    }
    
    const backendUrl = `http://localhost:5000/api/users/${encodeURIComponent(username)}`;
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.error || 'Error al eliminar usuario' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: data.message || `Usuario '${username}' eliminado correctamente`
    });
  } catch (error) {
    console.error('Exception in DELETE /api/users/[username]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
