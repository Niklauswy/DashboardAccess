import React from 'react';
import Image from 'next/image';

export default function Welcome() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">ola d mar</h1>
      <Image

        src="/vercel.svg"
        alt="Logo Cimarron UABC"
        width={100}
        height={100}
        />
    </div>
  );
}