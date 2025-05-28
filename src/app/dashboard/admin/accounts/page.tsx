"use client";

import { useEffect, useState } from "react";
import { FaHospital, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import Link from "next/link";

export default function PatientAccounts() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [newAccount, setNewAccount] = useState({
    fullName: "",
    email: "",
    address: "",
    dob: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
    const getData = async () => {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      setPatients(json);
    };
    getData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!mounted) return dateString;
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filtered = patients.filter(
    (p: any) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAccount = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });

    if (res.ok) {
      const refreshed = await fetch("/api/accounts");
      const json = await refreshed.json();
      setPatients(json);
      setShowAddAccount(false);
      setNewAccount({
        fullName: "",
        email: "",
        address: "",
        dob: "",
        password: "",
      });
    } else {
      alert("Gagal menambahkan akun pasien.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">DAFTAR AKUN PASIEN</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              placeholder="Cari nama/email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/30 border border-purple-500/30 text-white px-4 py-2 rounded-lg pl-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-64"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300/50" />
          </div>
          <button
            onClick={() => setShowAddAccount(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-2 rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
            title="Tambah Akun Pasien"
          >
            <FaPlus size={18} />
          </button>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="p-3 text-left text-purple-300">Nama</th>
                <th className="p-3 text-left text-purple-300">Email</th>
                <th className="p-3 text-left text-purple-300">Alamat</th>
                <th className="p-3 text-left text-purple-300">Tanggal Lahir</th>
                <th className="p-3 text-left text-purple-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                  <td className="p-3 text-white">{p.fullName}</td>
                  <td className="p-3 text-white">{p.email}</td>
                  <td className="p-3 text-white">{p.address}</td>
                  <td className="p-3 text-white">
                    {formatDate(p.dob)}
                  </td>
                  <td className="p-3 flex space-x-3">
                    <Link
                      href={`/dashboard/admin/accounts/edit/${p.id}` as const}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <FaEdit />
                    </Link>
                    <form
                      method="POST"
                      action={`/dashboard/admin/accounts/delete/${p.id}` as const}
                    >
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-purple-300/70">
                    Tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Akun */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gray-900 border border-purple-500/20 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddAccount(false)}
              className="absolute top-3 right-3 text-purple-300/70 hover:text-purple-300"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Tambah Akun Pasien</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                name="fullName"
                required
                className="w-full bg-black/30 border border-purple-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={newAccount.fullName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, fullName: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                className="w-full bg-black/30 border border-purple-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={newAccount.email}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, email: e.target.value })
                }
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full bg-black/30 border border-purple-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, password: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Alamat"
                name="address"
                className="w-full bg-black/30 border border-purple-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={newAccount.address}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, address: e.target.value })
                }
              />
              <input
                type="date"
                name="dob"
                required
                className="w-full bg-black/30 border border-purple-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={newAccount.dob}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, dob: e.target.value })
                }
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
