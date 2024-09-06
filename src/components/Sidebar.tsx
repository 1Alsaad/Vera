import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaArrowLeft } from 'react-icons/fa';

const Sidebar = ({ topicId, menuItems, searchTerm, setSearchTerm, selectedSection, setSelectedSection }) => {
  const router = useRouter();

  return (
    <nav className="bg-[#DDEBFF] dark:bg-gray-800 w-80 h-screen flex flex-col p-6">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-[#1F2937] dark:text-gray-100 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] mb-6">
          <FaArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#1F2937] dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4 text-[#1F2937] dark:text-gray-100">{topicId}</h2>

      <nav className="space-y-2 overflow-y-auto flex-grow">
        {menuItems.map((section) => (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
              selectedSection === section 
                ? 'bg-white dark:bg-gray-700 text-[#3B82F6] font-medium shadow-sm' 
                : 'text-[#1F2937] dark:text-gray-300 hover:bg-white hover:bg-opacity-50 dark:hover:bg-gray-700 dark:hover:bg-opacity-50'
            }`}
          >
            {section}
          </button>
        ))}
      </nav>
    </nav>
  );
};

export default Sidebar;