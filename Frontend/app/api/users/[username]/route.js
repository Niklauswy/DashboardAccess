import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { username } = params;
  // Could implement getting a specific user if needed
  return NextResponse.json({ username });
}

export async function PUT(request, { params }) {
  const { username } = params;
  
  try {
    const userData = await request.json();
    
    const response = await fetch(`http://localhost:5000/api/users/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    // Try to get JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If not JSON, get the text
      const text = await response.text();
      data = { error: text };
    }
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status || 500 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { username } = params;
  
  try {
    const response = await fetch(`http://localhost:5000/api/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
    });
    
    // Try to get JSON response first
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If not JSON, get the text
      const text = await response.text();
      data = { success: text || 'Usuario eliminado exitosamente' };
    }
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status || 500 });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 });
  }
}
