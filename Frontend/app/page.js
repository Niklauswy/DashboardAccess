import React from 'react';

async function getUsers() {
    const res = await fetch("http://localhost:5000/api/users", {
        cache: 'no-store'
    });
    const data = await res.json();
    return data;
}




const Page = async () => {
    const users = await getUsers();

    return (
        <div>
            <ul>
                {users.map((user, index) => (
                    <li key={index}>{JSON.stringify(user)}</li>
                ))}
            </ul>
        </div>
    );
};

export default Page;