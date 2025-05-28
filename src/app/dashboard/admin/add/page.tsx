import { prisma } from "@/lib/prisma";
import PatientSearch from "./PatientSearch";

export default async function AddMedicalRecord() {
  const patients = await prisma.patient.findMany();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-white">Tambah Data Rekam Medis</h1>
        </div>

        <form
          action="/dashboard/admin/submit"
          method="POST"
          className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-6"
        >
          <PatientSearch patients={patients} />

          <input
            name="penyakit"
            placeholder="Penyakit"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
          <input
            name="obat"
            placeholder="Obat"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
          <input
            name="dokter"
            placeholder="Dokter"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
          <input
            name="ruangan"
            placeholder="Ruangan"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
          <input
            name="tanggal"
            type="date"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2 rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
}
