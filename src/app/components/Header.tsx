import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-800">
            <Link href="/">
              CSRD Tools
            </Link>
          </div>
          <div className="space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
              Dashboard
            </Link>
            <Link href="/csrd-tools" className="text-gray-600 hover:text-gray-800">
              Tools
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-800">
              Profile
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;