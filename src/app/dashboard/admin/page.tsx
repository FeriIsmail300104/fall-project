"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiX, FiEdit, FiTrash, FiChevronDown } from "react-icons/fi";

interface Patient {
  id: string;
  fullName: string;
  dob: string | null;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string | null;
  penyakit: string;
  obat: string;
  dokter: string;
  ruangan: string;
  tanggal: string;
}

export default function AdminDashboard() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );

  // State searchable dropdown
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    penyakit: "",
    obat: "",
    dokter: "",
    ruangan: "",
    tanggal: "",
  });

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    console.log("formatDate input:", dateString, typeof dateString); // Debug log

    if (!dateString) return "Tanggal tidak tersedia";

    const date = new Date(dateString);
    console.log("Parsed date:", date, "isValid:", !isNaN(date.getTime())); // Debug log

    if (isNaN(date.getTime())) return "Tanggal tidak tersedia";

    // Check tanggal defaultnya  (1900-01-01)
    if (
      date.getFullYear() === 1900 &&
      date.getMonth() === 0 &&
      date.getDate() === 1
    ) {
      return "Tanggal tidak tersedia";
    }

    return date.toLocaleDateString("id-ID");
  };

  const load = async () => {
    try {
      const [r, p] = await Promise.all([
        fetch("/api/medical-records").then((res) => res.json()),
        fetch("/api/patients").then((res) => res.json()),
      ]);
      console.log("Loaded patients:", p); // Debug log untuk melihat struktur data
      setRecords(r);
      setPatients(p);
      setFilteredPatients(p);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("❌ Terjadi kesalahan saat memuat data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter patients berdasarkan pencarian
  useEffect(() => {
    const filtered = patients.filter((patient) =>
      patient.fullName.toLowerCase().includes(patientSearch.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patientSearch, patients]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !form.patientId ||
      !form.patientName ||
      !form.penyakit ||
      !form.obat ||
      !form.dokter ||
      !form.ruangan
    ) {
      alert("❌ Semua field harus diisi dan pasien harus dipilih dari daftar!");
      return;
    }

    const selectedPatient = patients.find((p) => p.id === form.patientId);
    if (!selectedPatient) {
      alert(
        "❌ Pasien tidak valid. Silakan pilih pasien dari daftar yang tersedia."
      );
      return;
    }

    // Validate that the patient name matches
    if (selectedPatient.fullName !== form.patientName) {
      alert("❌ Data pasien tidak konsisten. Silakan pilih ulang dari daftar.");
      return;
    }

    const method = editMode ? "PATCH" : "POST";
    const url = editMode
      ? `/api/medical-records/${selectedRecord?.id}`
      : `/api/medical-records`;

    // Prepare submission data
    const submitData = {
      ...form,

      tanggal: editMode && form.tanggal ? form.tanggal : undefined,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Data berhasil disimpan");
        resetForm();
        load();
      } else {
        alert("❌ " + data.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("❌ Terjadi kesalahan saat menyimpan data");
    }
  };

  const resetForm = () => {
    setForm({
      patientId: "",
      patientName: "",
      penyakit: "",
      obat: "",
      dokter: "",
      ruangan: "",
      tanggal: "",
    });
    setPatientSearch("");
    setShowPatientDropdown(false);
    setIsOpen(false);
    setEditMode(false);
    setSelectedRecord(null);
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setEditMode(true);
    setIsOpen(true);
    setForm({
      patientId: record.patientId,
      patientName: record.patientName ?? "",
      penyakit: record.penyakit,
      obat: record.obat,
      dokter: record.dokter,
      ruangan: record.ruangan,
      tanggal: record.tanggal.slice(0, 16), // Include time for datetime-local
    });
    setPatientSearch(record.patientName ?? "");
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus data ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/medical-records/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Data berhasil dihapus");
        load();
      } else {
        const data = await res.json();
        alert("❌ " + (data.error || "Gagal menghapus data"));
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("❌ Terjadi kesalahan saat menghapus data");
    }
  };

  // Handle patient selection dari dropdown
  const handlePatientSelect = (patient: Patient) => {
    setForm({
      ...form,
      patientId: patient.id,
      patientName: patient.fullName,
    });
    setPatientSearch(patient.fullName);
    setShowPatientDropdown(false);
  };

  // Handle manual typing in patient search - clear patientId if text doesn't match any patient
  const handlePatientSearchChange = (value: string) => {
    setPatientSearch(value);
    setShowPatientDropdown(true);

    // Check if the typed value exactly matches an existing patient
    const exactMatch = patients.find(
      (p) => p.fullName.toLowerCase() === value.toLowerCase()
    );

    if (exactMatch) {
      setForm({
        ...form,
        patientId: exactMatch.id,
        patientName: exactMatch.fullName,
      });
    } else {
      // Clear patientId if no exact match
      setForm({
        ...form,
        patientId: "",
        patientName: value,
      });
    }
  };

  const filtered = records.filter((r) =>
    r.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome back, admin@hospital.com
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditMode(false);
            setIsOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
        >
          <FiPlus />
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari nama pasien..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 mb-4 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold text-lg mb-3">Patient Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Nama Pasien</th>
                <th className="p-2 text-left">Tanggal Lahir</th>
                <th className="p-2 text-left">Penyakit</th>
                <th className="p-2 text-left">Obat</th>
                <th className="p-2 text-left">Dokter</th>
                <th className="p-2 text-left">Ruangan</th>
                <th className="p-2 text-left">Waktu Diagnosis</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{r.patientName}</td>
                  <td className="p-2">{formatDate(r.patientDob)}</td>
                  <td className="p-2">{r.penyakit}</td>
                  <td className="p-2">{r.obat}</td>
                  <td className="p-2">{r.dokter}</td>
                  <td className="p-2">{r.ruangan}</td>
                  <td className="p-2">
                    <div className="text-xs">
                      <div>
                        {new Date(r.tanggal).toLocaleDateString("id-ID")}
                      </div>
                      <div className="text-gray-500">
                        {new Date(r.tanggal).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2 text-lg">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Hapus"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 p-4">
                    {search ? "Data tidak ditemukan" : "Belum ada data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={resetForm} />
          <div className="bg-white max-w-md w-full p-6 rounded shadow relative z-10 mx-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4">
              {editMode ? "Edit Rekam Medis" : "Tambah Rekam Medis"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {editMode ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pasien
                  </label>
                  <input
                    name="patientName"
                    value={form.patientName}
                    onChange={(e) =>
                      setForm({ ...form, patientName: e.target.value })
                    }
                    placeholder="Nama Pasien"
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    readOnly
                  />
                </div>
              ) : (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pasien *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Pilih pasien dari daftar..."
                      value={patientSearch}
                      onChange={(e) =>
                        handlePatientSearchChange(e.target.value)
                      }
                      onFocus={() => setShowPatientDropdown(true)}
                      className={`w-full border p-2 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !form.patientId && patientSearch
                          ? "border-red-300 bg-red-50"
                          : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPatientDropdown(!showPatientDropdown)
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiChevronDown
                        className={`transition-transform ${
                          showPatientDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Validation indicator */}
                  {!form.patientId && patientSearch && (
                    <div className="text-xs text-red-600 mt-1">
                      ⚠️ Pasien harus dipilih dari daftar yang tersedia
                    </div>
                  )}

                  {form.patientId && (
                    <div className="text-xs text-green-600 mt-1">
                      ✅ Pasien terpilih
                    </div>
                  )}

                  {showPatientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                          console.log("Patient in dropdown:", patient);
                          return (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={() => handlePatientSelect(patient)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 border-b last:border-b-0 transition-colors"
                            >
                              <div className="font-medium">
                                {patient.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                Lahir: {formatDate(patient.dob)}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          {patientSearch
                            ? "Tidak ditemukan"
                            : "Ketik untuk mencari..."}
                        </div>
                      )}

                      {patientSearch &&
                        !filteredPatients.some(
                          (p) =>
                            p.fullName.toLowerCase() ===
                            patientSearch.toLowerCase()
                        ) && (
                          <div className="px-3 py-2 text-red-600 text-sm">
                            ❌ Pasien tidak ditemukan. Harap pilih dari daftar
                            yang tersedia.
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Input fields lainnya */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penyakit *
                </label>
                <input
                  name="penyakit"
                  placeholder="Masukkan nama penyakit"
                  value={form.penyakit}
                  onChange={(e) =>
                    setForm({ ...form, penyakit: e.target.value })
                  }
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obat *
                </label>
                <input
                  name="obat"
                  placeholder="Masukkan nama obat"
                  value={form.obat}
                  onChange={(e) => setForm({ ...form, obat: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dokter *
                </label>
                <input
                  name="dokter"
                  placeholder="Masukkan nama dokter"
                  value={form.dokter}
                  onChange={(e) => setForm({ ...form, dokter: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruangan *
                </label>
                <input
                  name="ruangan"
                  placeholder="Masukkan ruangan"
                  value={form.ruangan}
                  onChange={(e) =>
                    setForm({ ...form, ruangan: e.target.value })
                  }
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tanggal Diagnosis ,Hanya tampil untuk edit mode */}
              {editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Diagnosis
                  </label>
                  <input
                    name="tanggal"
                    type="datetime-local"
                    value={form.tanggal}
                    onChange={(e) =>
                      setForm({ ...form, tanggal: e.target.value })
                    }
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Info untuk mode tambah */}
              {!editMode && (
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                  ℹ️ Waktu diagnosis akan diset otomatis pada saat penyimpanan
                </div>
              )}

              {/* Warning jika pasien belum dipilih */}
              {!editMode && !form.patientId && (
                <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                  ⚠️ Pasien harus dipilih dari daftar yang tersedia sebelum
                  menyimpan
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!editMode && !form.patientId}
                  className={`flex-1 py-2 rounded transition-colors ${
                    !editMode && !form.patientId
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
