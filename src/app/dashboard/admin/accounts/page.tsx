"use client";

import { useEffect, useState } from "react";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";

export default function PatientAccounts() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [newAccount, setNewAccount] = useState({
    fullName: "",
    email: "",
    address: "",
    dob: "",
    password: "",
  });

  const [editAccount, setEditAccount] = useState({
    id: "",
    fullName: "",
    email: "",
    address: "",
    dob: "",
    password: "",
  });

  useEffect(() => {
    const getData = async () => {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      setPatients(json);
    };
    getData();
  }, []);

  const filtered = patients.filter(
    (p: any) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAccount = async (e: React.FormEvent) => {
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
      alert("Berhasil ditambahkan");
    } else {
      alert("Gagal menambahkan akun pasien.");
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/accounts/${editAccount.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: editAccount.fullName,
        email: editAccount.email,
        address: editAccount.address,
        dob: editAccount.dob,
        ...(editAccount.password && { password: editAccount.password }),
      }),
    });

    if (res.ok) {
      const refreshed = await fetch("/api/accounts");
      const json = await refreshed.json();
      setPatients(json);
      setShowEditAccount(false);
      setEditAccount({
        id: "",
        fullName: "",
        email: "",
        address: "",
        dob: "",
        password: "",
      });
      alert("Berhasil diperbarui");
    } else {
      alert("Gagal memperbarui akun pasien.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedPatient?.id) return;

    const res = await fetch(`/api/accounts/${selectedPatient.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const refreshed = await fetch("/api/accounts");
      const json = await refreshed.json();
      setPatients(json);
      setShowDeleteConfirm(false);
      setSelectedPatient(null);
      alert("Berhasil dihapus");
    } else {
      alert("Gagal menghapus akun pasien.");
    }
  };

  const openEditModal = (patient: any) => {
    setEditAccount({
      id: patient.id,
      fullName: patient.fullName,
      email: patient.email,
      address: patient.address,
      dob: patient.dob ? new Date(patient.dob).toISOString().split("T")[0] : "",
      password: "",
    });
    setShowEditAccount(true);
  };

  const openDeleteModal = (patient: any) => {
    setSelectedPatient(patient);
    setShowDeleteConfirm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Akun Pasien</h1>
        <div className="flex items-center space-x-2">
          <input
            placeholder="Cari nama/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-1 rounded text-sm w-64"
          />
          <button
            onClick={() => setShowAddAccount(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
            title="Tambah Akun Pasien"
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Alamat</th>
              <th className="p-3">Tanggal Lahir</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.fullName}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">{p.address}</td>
                <td className="p-3">
                  {new Date(p.dob).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Akun"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => openDeleteModal(p)}
                    className="text-red-600 hover:text-red-800"
                    title="Hapus Akun"
                  >
                    <FiTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Akun */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddAccount(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Tambah Akun Pasien</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                name="fullName"
                required
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, password: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Alamat"
                name="address"
                className="w-full border rounded px-3 py-2"
                value={newAccount.address}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, address: e.target.value })
                }
              />
              <input
                type="date"
                name="dob"
                required
                className="w-full border rounded px-3 py-2"
                value={newAccount.dob}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, dob: e.target.value })
                }
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2 rounded border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Akun */}
      {showEditAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowEditAccount(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Akun Pasien</h2>
            <form onSubmit={handleEditAccount} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                name="fullName"
                required
                className="w-full border rounded px-3 py-2"
                value={editAccount.fullName}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, fullName: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                className="w-full border rounded px-3 py-2"
                value={editAccount.email}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, email: e.target.value })
                }
              />
              <input
                type="password"
                name="password"
                placeholder="Password Baru (kosongkan jika tidak diubah)"
                className="w-full border rounded px-3 py-2"
                value={editAccount.password}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, password: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Alamat"
                name="address"
                className="w-full border rounded px-3 py-2"
                value={editAccount.address}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, address: e.target.value })
                }
              />
              <input
                type="date"
                name="dob"
                required
                className="w-full border rounded px-3 py-2"
                value={editAccount.dob}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, dob: e.target.value })
                }
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditAccount(false)}
                  className="px-4 py-2 rounded border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Konfirmasi Hapus
            </h2>
            <p className="mb-6 text-gray-700">
              Apakah Anda yakin ingin menghapus akun pasien{" "}
              <strong>{selectedPatient?.fullName}</strong>? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded border"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
