
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-gray-200 bg-white">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Social Ad Image Variator</h1>
        <p className="mt-1 text-md text-gray-500">
          Generate endless creative variations of your ad images with AI.
        </p>
      </div>
    </header>
  );
};

export default Header;
