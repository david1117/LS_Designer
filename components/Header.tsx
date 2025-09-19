import React from 'react';
import { SparklesIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center space-x-3">
        <SparklesIcon className="h-8 w-8 text-indigo-400" />
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
          家具空間風格師
        </h1>
      </div>
    </header>
  );
};