'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHome, FaBell, FaUser } from 'react-icons/fa';

export default function Header() {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <div className="flex justify-end items-center mb-8">
      <div className="flex items-center space-x-4">
        <Link href="/get-started">
          <a className="h-10 text-[#1F2937] px-4 rounded-md border border-[#71A1FC] hover:bg-[#F3F4F6] flex items-center justify-center transition duration-300">
            Get Started
          </a>
        </Link>
        <button className="h-10 text-[#1F2937] px-4 rounded-md border border-[#71A1FC] hover:bg-[#F3F4F6] transition duration-300">
          Create Report
        </button>
        <FaHome className="text-[#1F2937] text-2xl cursor-pointer" />
        <FaBell className="text-[#1F2937] text-2xl cursor-pointer" />
        <FaUser 
          className="text-[#1F2937] text-2xl cursor-pointer" 
          onClick={handleProfileClick}
        />
      </div>
    </div>
  );
}