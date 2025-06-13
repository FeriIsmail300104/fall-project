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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Akun Admin</h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm({ email: "", password: "" });
            setIsOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
        >
          <FiPlus />
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari admin..."
        className="border px-3 py-2 rounded w-full md:w-1/3 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Daftar Admin</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Email</th>
              <th className="text-center p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a: any) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.email}</td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-500">
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
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white max-w-sm w-full p-6 rounded shadow relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
            >
              <FiX />
            </button>
            <Dialog.Title className="text-lg font-bold mb-4">
              {editId ? "Edit Admin" : "Tambah Admin"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border p-2 rounded"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                name="password"
                placeholder={editId ? "Password baru (opsional)" : "Password"}
                className="w-full border p-2 rounded"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editId}
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
                {editId ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
