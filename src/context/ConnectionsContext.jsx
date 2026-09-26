import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";

const ConnectionsContext = createContext(null);

function normalizeConnection(c) {
  return { ...c, id: c._id || c.id, fromEmail: c.from?.email, toEmail: c.to?.email, fromUser: c.from, toUser: c.to };
}

export function ConnectionsProvider({ children }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);

  const load = useCallback(async () => {
    if (!user) { setConnections([]); return; }
    try { const data = await api("/api/connections"); setConnections((data.connections || []).map(normalizeConnection)); }
    catch (error) { console.error("Connections load failed:", error); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const findConnectionBetween = useCallback((a, b) => connections.find((c) => (c.fromEmail === a && c.toEmail === b) || (c.fromEmail === b && c.toEmail === a)) || null, [connections]);

  const getStatusWith = useCallback((otherEmail) => {
    if (!user?.email || !otherEmail || otherEmail === user.email) return { status: "self" };
    const c = findConnectionBetween(user.email, otherEmail);
    if (!c) return { status: "none" };
    if (c.status === "accepted") return { status: "accepted", connection: c };
    if (c.status === "rejected") return { status: "rejected", connection: c };
    return { status: c.fromEmail === user.email ? "pending_sent" : "pending_received", connection: c };
  }, [user, findConnectionBetween]);

  async function sendRequest(emailOrId) {
    try {
      let target = emailOrId;
      if (String(emailOrId).includes("@")) {
        const u = (await api("/api/users")).users.find((x) => x.email === emailOrId);
        if (!u) throw new Error("User not found");
        target = u.id || u._id;
      }
      await api("/api/connections", { method: "POST", body: JSON.stringify({ to: target }) });
      await load();
      return { success: true };
    } catch (error) { return { error: error.message }; }
  }

  async function changeRequest(id, status) {
    try { await api(`/api/connections/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); return { success: true }; }
    catch (error) { return { error: error.message }; }
  }

  const myConnections = connections.filter((c) => c.fromEmail === user?.email || c.toEmail === user?.email);
  const incomingRequests = myConnections.filter((c) => c.status === "pending" && c.toEmail === user?.email);
  const outgoingRequests = myConnections.filter((c) => c.status === "pending" && c.fromEmail === user?.email);
  const acceptedConnections = myConnections.filter((c) => c.status === "accepted");

  async function getConversations() {
    try { const data = await api("/api/messages"); return data.conversations || []; }
    catch { return []; }
  }

  async function getMessagesFor(otherUserId) {
    try { const data = await api(`/api/messages/${otherUserId}`); return data.messages || []; }
    catch { return []; }
  }

  async function sendMessage(receiverId, text) {
    try { const data = await api("/api/messages", { method: "POST", body: JSON.stringify({ receiver: receiverId, message: text }) }); return { success: true, message: data.data }; }
    catch (error) { return { error: error.message }; }
  }

  const value = { connections, reload: load, getStatusWith, sendRequest, acceptRequest: (id) => changeRequest(id, "accepted"), rejectRequest: (id) => changeRequest(id, "rejected"), cancelRequest: (id) => changeRequest(id, "cancelled"), incomingRequests, outgoingRequests, acceptedConnections, getConversations, getMessagesFor, sendMessage };
  return <ConnectionsContext.Provider value={value}>{children}</ConnectionsContext.Provider>;
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) throw new Error("useConnections must be used within ConnectionsProvider");
  return ctx;
}
