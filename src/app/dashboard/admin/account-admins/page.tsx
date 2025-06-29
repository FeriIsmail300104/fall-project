"use client";
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadAdmins = async () => {
    const res = await fetch("/api/admins");
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editId ? "PATCH" : "POST";
    const url = editId ? `/api/admins/${editId}` : "/api/admins";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert(editId ? "✅ Admin diperbarui" : "✅ Admin ditambahkan");
      setForm({ email: "", password: "" });
      setEditId(null);
      setIsOpen(false);
      loadAdmins();
    } else {
      const error = await res.json();
      alert("❌ " + error.error || "Gagal menyimpan");
    }
  };

  const handleEdit = (admin: any) => {
    setEditId(admin.id);
    setForm({ email: admin.email, password: "" });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus admin ini?")) return;
    const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("✅ Admin dihapus");
      loadAdmins();
    } else {
      alert("❌ Gagal hapus");
    }
  };

  const filtered = admins.filter((a: any) =>
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Akun Admin</h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm({ email: "", password: "" });
            setIsOpen(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-3 rounded-full transition-colors shadow-lg shadow-purple-500/20 hover:scale-105"
        >
          <FiPlus />
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari admin..."
        className="border border-purple-500/20 bg-black/40 backdrop-blur-lg px-4 py-2.5 mb-4 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-black/40 backdrop-blur-lg rounded-lg shadow-lg border border-purple-500/20 p-6">
        <h2 className="text-lg font-semibold mb-3 text-white">Daftar Admin</h2>
        <table className="w-full text-sm border border-purple-500/20 rounded-lg">
          <thead className="bg-black/40">
            <tr>
              <th className="text-left p-3 text-purple-300">Email</th>
              <th className="text-center p-3 text-purple-300">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a: any) => (
              <tr key={a.id} className="border-t border-purple-500/10 hover:bg-purple-500/5">
                <td className="p-3 text-white">{a.email}</td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FiTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-center text-purple-300/70">
                  Tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-black/90 max-w-sm w-full p-6 rounded-lg shadow-lg relative border border-purple-500/20">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-purple-300/70 hover:text-red-400 transition-colors"
            >
              <FiX />
            </button>
            <Dialog.Title className="text-lg font-bold mb-4 text-white">
              {editId ? "Edit Admin" : "Tambah Admin"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                name="password"
                placeholder={editId ? "Password baru (opsional)" : "Password"}
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editId}
              />
              <button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2.5 rounded-lg w-full shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all duration-200">
                {editId ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
