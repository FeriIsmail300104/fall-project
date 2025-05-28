'use client'

import { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import { saveSessions, loadSessions } from "./storage";
import { FiSearch, FiPlus, FiChevronLeft, FiChevronRight, FiMic, FiMicOff } from "react-icons/fi";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef(null);
  const isInitialMount = useRef(true);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'id-ID';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErr('Speech recognition tidak didukung di browser Anda');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Load sessions from localStorage on mount and when currentSessionId changes
  useEffect(() => {
    const saved = loadSessions();
    if (saved.length) {
      setSessions(saved);
      // If we have a currentSessionId, try to keep it
      if (currentSessionId && saved.some(s => s.id === currentSessionId)) {
        setCurrentSessionId(currentSessionId);
      } else {
        // Otherwise use the first session
        setCurrentSessionId(saved[0].id);
      }
    } else {
      // Create initial session if none exists
      const initialSession = { 
        id: Date.now(), 
        title: "Obrolan Baru", 
        messages: [], 
        pinned: false, 
        editing: false 
      };
      setSessions([initialSession]);
      setCurrentSessionId(initialSession.id);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveSessions(sessions);
  }, [sessions]);

  // 3. Scroll otomatis ke bawah saat messages atau loading berubah
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [sessions, currentSessionId, loading]);

  // 4. CRUD sesi
  const startNewSession = () => {
    const newSession = { id: Date.now(), title: "Obrolan Baru", messages: [], pinned: false, editing: false };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setInput("");
    setErr("");
  };
  const handleEditTitle = (id, title) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title, editing: false } : s)));
  const handleTogglePin = (id) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
  const handleDeleteSession = (id) => {
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered.length ? filtered[0].id : null);
    }
  };
  const handleTitleClick = (id) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, editing: true } : s)));

  // 5. Kirim pesan ke OpenAI
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setErr("");
    setLoading(true);

    const userMsg = { role: "user", content: input };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s,
      ),
    );
    setInput("");

    try {
      const openai = new OpenAI({ 
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, 
        dangerouslyAllowBrowser: true 
      });
      const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: input }],
        max_tokens: 100,
      });
      const aiMsg = { role: "assistant", content: res.choices[0].message.content };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...s.messages, aiMsg],
                title:
                  s.title === "Obrolan Baru"
                    ? input.split(/[.!?]/)[0].slice(0, 20).trim() + (input.length > 20 ? "…" : "")
                    : s.title,
              }
            : s,
        ),
      );
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Derivasi tampilan
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  const sortedSessions = [...sessions.filter((s) => s.pinned), ...sessions.filter((s) => !s.pinned)];

  // 7. Render UI
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-72" : "w-0 opacity-0"
        } bg-black/40 backdrop-blur-lg p-4 border-r border-purple-500/20 overflow-y-auto transition-all duration-300 relative`}
      >
        {/* Sidebar Toggle Button - Inside sidebar when open */}
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#333] transition-colors"
          >
            <FiChevronLeft size={20} />
          </button>
        )}

        <div className="flex items-center gap-2 mb-4">
          <FiSearch className="text-purple-400" size={20} />
          <span className="text-purple-400 text-xl font-semibold">Search Chat</span>
        </div>
        
        <button
          onClick={startNewSession}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 w-full py-2 rounded text-sm mb-4 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
        >
          <FiPlus size={18} />
          <span>Obrolan Baru</span>
        </button>

        {sortedSessions.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between p-2 rounded text-sm hover:bg-purple-500/5 ${
              s.id === currentSessionId ? "bg-purple-500/10" : ""
            }`}
          >
            {s.editing ? (
              <input
                autoFocus
                defaultValue={s.title}
                onBlur={(e) => handleEditTitle(s.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                className="bg-transparent border-b border-gray-400 flex-grow mr-2 outline-none"
              />
            ) : (
              <div
                className="flex-grow cursor-pointer flex items-center gap-2"
                onClick={() => {
                  setCurrentSessionId(s.id);
                  setDropdownOpenId(null);
                }}
                onDoubleClick={() => handleTitleClick(s.id)}
              >
                {s.pinned && <span title="Pinned">📌</span>}
                <span>{s.title}</span>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setDropdownOpenId(dropdownOpenId === s.id ? null : s.id)}
                className="ml-2 hover:text-purple-400"
              >
                ⋮
              </button>
              {dropdownOpenId === s.id && (
                <div className="absolute right-0 mt-2 w-32 bg-black/40 backdrop-blur-lg border border-purple-500/20 rounded shadow-lg z-10 text-xs">
                  <button
                    onClick={() => {
                      handleTogglePin(s.id);
                      setDropdownOpenId(null);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#444]"
                  >
                    {s.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteSession(s.id);
                      setDropdownOpenId(null);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#444] text-red-400"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </aside>

      {/* Chat Area */}
      <main className={`flex-1 flex flex-col p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Sidebar Toggle Button - On main content when closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-[#333] transition-colors"
          >
            <FiChevronRight size={20} />
          </button>
        )}
        
        <h1 className="text-purple-400 text-3xl font-bold mb-6">FallChatBot</h1>

        <div ref={chatRef} className="flex-1 overflow-y-auto bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-br-none"
                    : "bg-white/10 text-white rounded-bl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 max-w-[60%] px-4 py-3 rounded-xl rounded-bl-none animate-pulse">
                ....
              </div>
            </div>
          )}
          {err && <p className="text-red-500 mt-2 text-sm">{err}</p>}
        </div>

        <form onSubmit={handleSubmit} className="flex mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-black/40 backdrop-blur-lg flex-grow p-3 border border-purple-500/20 rounded-l-lg outline-none"
            placeholder="Ketik sesuatu…"
            required
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`px-4 border border-purple-500/20 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-black/40 hover:bg-black/60'}`}
          >
            {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 px-6 rounded-r-lg font-semibold disabled:opacity-50 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
          >
            Kirim
          </button>
        </form>
      </main>
    </div>
  );
}
