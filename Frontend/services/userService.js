/**
 * Service for handling user-related API operations
 */

export async function fetchUsers() {
    const response = await fetch('/api/users', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
}

export async function fetchUser(username) {
    const response = await fetch(`/api/users/${username}`);
    if (!response.ok) throw new Error(`Failed to fetch user ${username}`);
    return response.json();
}

export async function createUser(userData) {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create user');
    }
    
    return response.json();
}

export async function updateUser(username, userData) {
    const response = await fetch(`/api/users/${username}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update user');
    }
    
    return response.json();
}

export async function deleteUser(username) {
    const response = await fetch(`/api/users/${username}`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete user');
    }
    
    return true;
}

export async function batchUpdatePasswords(usernames, newPassword) {
    const response = await fetch('/api/users/batch/password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            usernames,
            password: newPassword
        }),
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update passwords');
    }
    
    return response.json();
}

export async function batchDeleteUsers(usernames) {
    const response = await fetch('/api/users/batch/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernames }),
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete users');
    }
    
    return response.json();
}

export async function fetchOus() {
    const response = await fetch('/api/ous');
    if (!response.ok) throw new Error('Failed to fetch OUs');
    return response.json();
}

export async function fetchGroups() {
    const response = await fetch('/api/groups');
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
}
