import React from 'react';
import { HomeIcon } from 'lucide-react';

const SidebarTitle = () => {
  return (
    <div className="flex items-center px-4 py-2 border-b border-gray-300">
      <HomeIcon className="ml-4 h-6 w-6 text-gray-700 mr-2" />
      <h1 className="text-xl font-semibold text-gray-700">Access Dashboard</h1>
    </div>
  );
};

export default SidebarTitle;