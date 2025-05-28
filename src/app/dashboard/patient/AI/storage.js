// storage.js

const STORAGE_KEY = "fallchatbot_sessions";

export function saveSessions(sessions) {
  try {
    // Validate sessions data
    if (!Array.isArray(sessions)) {
      console.error("Invalid sessions data: not an array");
      return;
    }
    
    // Validate each session
    const validSessions = sessions.filter(session => {
      return (
        session &&
        typeof session === 'object' &&
        typeof session.id === 'number' &&
        typeof session.title === 'string' &&
        Array.isArray(session.messages)
      );
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
  } catch (error) {
    console.error("Gagal menyimpan sesi:", error);
  }
}

export function loadSessions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    
    // Validate parsed data
    if (!Array.isArray(parsed)) {
      console.error("Invalid saved data: not an array");
      return [];
    }
    
    // Validate and clean each session
    return parsed.filter(session => {
      return (
        session &&
        typeof session === 'object' &&
        typeof session.id === 'number' &&
        typeof session.title === 'string' &&
        Array.isArray(session.messages)
      );
    });
  } catch (error) {
    console.error("Gagal memuat sesi:", error);
    return [];
  }
}
