'use client';

import { useRouter } from 'next/navigation';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/dashboard/patient?page=${page}`);
  };

  return (
    <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-lg">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-white hover:bg-purple-600 hover:scale-105"
        }`}
      >
        <IoIosArrowBack className="text-xl" />
      </button>
      
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">Page</span>
        <span className="text-purple-400 font-bold">{currentPage}</span>
        <span className="text-white font-medium">of</span>
        <span className="text-purple-400 font-bold">{totalPages}</span>
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-white hover:bg-purple-600 hover:scale-105"
        }`}
      >
        <IoIosArrowForward className="text-xl" />
      </button>
    </div>
  );
} 