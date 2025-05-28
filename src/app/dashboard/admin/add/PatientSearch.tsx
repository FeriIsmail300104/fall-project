'use client';

import { useState, useRef, useEffect } from 'react';

interface Patient {
  id: string;
  fullName: string;
}

interface PatientSearchProps {
  patients: Patient[];
}

export default function PatientSearch({ patients }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative mb-3" ref={searchRef}>
      <input
        type="text"
        name="patientSearch"
        placeholder="Cari nama pasien..."
        className="w-full p-2 border border-purple-500/20 bg-black/40 text-white rounded-lg focus:outline-none focus:border-purple-500"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowResults(true);
        }}
        required
      />
      <input
        type="hidden"
        name="patientId"
        id="selectedPatientId"
        required
      />
      {showResults && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-black/90 border border-purple-500/20 rounded-lg shadow-lg">
          {filteredPatients.length === 0 ? (
            <div className="p-2 text-white">Tidak ada hasil</div>
          ) : (
            filteredPatients.map((p) => (
              <div
                key={p.id}
                className="p-2 hover:bg-purple-500/20 cursor-pointer text-white"
                onClick={() => {
                  setSearchTerm(p.fullName);
                  const hiddenInput = document.getElementById('selectedPatientId') as HTMLInputElement;
                  hiddenInput.value = p.id;
                  setShowResults(false);
                }}
              >
                {p.fullName}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 