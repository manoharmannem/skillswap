import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "../lib/api.js";

const AuthContext = createContext(null);

function normalizeUser(u) {
  if (!u) return null;
  return { ...u, id: u.id || u._id, fullName: u.fullName || u.name, name: u.name || u.fullName, skills: u.skills || [], learningSkills: u.learningSkills || [], credits: u.credits ?? 0, practiceModules: u.practiceModules || [], quizScores: u.quizScores || {} };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refreshDirectory() {
    try {
      const data = await api("/api/users");
      setUsers((data.users || []).map(normalizeUser));
    } catch (error) {
      console.error("Directory load failed:", error);
    }
  }

  const refreshPractice = async () => {
    try {
      const data = await api("/api/practice");
      setUser((prev) => prev ? { ...prev, practiceModules: data.modules || [] } : prev);
    } catch (error) {
      console.error("Practice load failed:", error);
    }
  };

  useEffect(() => {
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const data = await api("/api/auth/me");
        setUser(normalizeUser(data.user));
        setLoading(false);

        // Load large secondary datasets after the authenticated shell is ready.
        void Promise.allSettled([refreshPractice(), refreshDirectory()]);
      } catch {
        setToken(null);
        setLoading(false);
      }
    })();
  }, []);

  async function migrateLegacyProfile(next) {
    try {
      const raw = localStorage.getItem("skillswap:users");
      if (!raw) return next;
      const legacyUsers = JSON.parse(raw);
      const legacy = Array.isArray(legacyUsers) ? legacyUsers.find((u) => u.email === next.email) : null;
      if (!legacy) return next;
      const legacySkills = Array.isArray(legacy.skills) ? legacy.skills : [];
      if (!legacySkills.length && !legacy.bio) return next;
      const data = await api("/api/profile/me", { method: "PUT", body: JSON.stringify({ name: next.fullName, bio: legacy.bio || next.bio || "", skills: legacySkills.length ? legacySkills : next.skills, learningSkills: legacy.learningSkills || next.learningSkills || [] }) });
      const migrated = normalizeUser(data.user);
      localStorage.removeItem("skillswap:users");
      return migrated;
    } catch { return next; }
  }

  async function signUp({ fullName, email, password, skills, learningSkills = [] }) {
    try {
      const data = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: fullName.trim(), email: email.trim().toLowerCase(), password, skills, learningSkills }) });
      setToken(data.token);
      let next = normalizeUser(data.user);
      next = await migrateLegacyProfile(next);
      setUser(next);
      // Keep login fast: directory + Practice are secondary data.
      void Promise.allSettled([refreshPractice(), refreshDirectory()]);
      return { user: next };
    } catch (error) { return { error: error.message }; }
  }

  async function signIn({ email, password }) {
    try {
      const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      setToken(data.token);
      let next = normalizeUser(data.user);
      next = await migrateLegacyProfile(next);
      setUser(next);
      // Keep login fast: directory + Practice are secondary data.
      void Promise.allSettled([refreshPractice(), refreshDirectory()]);
      return { user: next };
    } catch (error) { return { error: error.message }; }
  }

  function signOut() { setToken(null); setUser(null); }

  async function updateProfile(partial) {
    if (!user) return { error: "Not signed in" };
    try {
      const data = await api("/api/profile/me", { method: "PUT", body: JSON.stringify({ name: partial.fullName ?? user.fullName, bio: partial.bio ?? user.bio, skills: partial.skills ?? user.skills, learningSkills: partial.learningSkills ?? user.learningSkills }) });
      const next = normalizeUser(data.user);
      setUser(next);
      setUsers((prev) => prev.map((u) => u.email === next.email ? { ...u, ...next } : u));
      return { user: next };
    } catch (error) { return { error: error.message }; }
  }

  async function updatePracticeModules(practiceModules) {
    try {
      const data = await api("/api/practice", { method: "PUT", body: JSON.stringify({ modules: practiceModules }) });
      setUser((prev) => prev ? { ...prev, practiceModules: data.modules || practiceModules } : prev);
      return { success: true };
    } catch (error) { return { error: error.message }; }
  }

  async function recordQuizScore(quizId, answers) {
    try {
      const data = await api(`/api/quizzes/${quizId}/attempt`, { method: "POST", body: JSON.stringify({ answers }) });
      setUser((prev) => prev ? { ...prev, credits: data.credits, quizScores: { ...(prev.quizScores || {}), [quizId]: { score: data.score, total: data.total, date: new Date().toISOString() } } } : prev);
      return data;
    } catch (error) { return { error: error.message }; }
  }

  function listUsers() { return users; }
  function findUserByEmail(email) { return users.find((u) => u.email === String(email || "").trim().toLowerCase()) || null; }

  const value = { user, loading, signUp, signIn, signOut, updateProfile, updatePracticeModules, recordQuizScore, listUsers, findUserByEmail, refreshDirectory, refreshPractice };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
