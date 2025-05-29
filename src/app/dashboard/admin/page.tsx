import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FaHospital, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import PaginationControls from "../patient/PaginationControls";

const ITEMS_PER_PAGE = 10;

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  // Ensure searchParams is handled properly
  const page = searchParams?.page;
  const currentPage = page ? Number(page) : 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [records, totalRecords] = await Promise.all([
    prisma.medicalRecord.findMany({
      include: {
        patient: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip,
    }),
    prisma.medicalRecord.count(),
  ]);

  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">PATIENT MANAGEMENT DASHBOARD</h1>
          </div>
          <p className="text-sm text-purple-300/70 mt-1">
            Welcome back, admin@hospital.com
          </p>
        </div>
        <Link
          href="/dashboard/admin/add"
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
        >
          <FaPlus />
          Add Record
        </Link>
      </div>

      <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="p-3 text-left text-purple-300">Name Pasien</th>
                <th className="p-3 text-left text-purple-300">Riwayat Penyakit</th>
                <th className="p-3 text-left text-purple-300">Obat</th>
                <th className="p-3 text-left text-purple-300">Nama Dokter</th>
                <th className="p-3 text-left text-purple-300">Ruangan</th>
                <th className="p-3 text-left text-purple-300">Tanggal</th>
                <th className="p-3 text-left text-purple-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-purple-300/70">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                    <td className="p-3 text-white">{record.patient.fullName}</td>
                    <td className="p-3 text-white">{record.penyakit}</td>
                    <td className="p-3 text-white">{record.obat}</td>
                    <td className="p-3 text-white">{record.dokter}</td>
                    <td className="p-3 text-white">{record.ruangan}</td>
                    <td className="p-3 text-white">
                      {new Date(record.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3 space-x-3">
                      <Link
                        href={`/dashboard/admin/edit/${record.id}` as const}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <FaEdit />
                      </Link>
                      <form
                        action={`/dashboard/admin/delete/${record.id}` as const}
                        method="POST"
                        className="inline"
                      >
                        <button type="submit" className="text-red-400 hover:text-red-300 transition-colors">
                          <FaTrash />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
