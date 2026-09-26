import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { CheckCircle2, Circle } from "lucide-react";
const filters = ["All", "Not started", "Completed"];
export default function Practice() {
  const { user, updatePracticeModules } = useAuth(); const toast = useToast(); const [filter, setFilter] = useState("All"); const modules = user?.practiceModules || [];
  const visible = modules.filter((m) => filter === "Completed" ? m.completed : filter === "Not started" ? !m.completed : true);
  async function toggleComplete(id) { const updated = modules.map((m) => m.id === id ? { ...m, completed: !m.completed } : m); const result = await updatePracticeModules(updated); if (result.error) toast.error(result.error); else toast.success(updated.find((m) => m.id === id).completed ? "Practice saved to MongoDB" : "Marked as not started"); }
  return <div><p className="page-eyebrow">Sharpen your skills</p><h1 className="page-title">Practice</h1><p className="page-sub">Your practice progress is saved to MongoDB.</p><div className="quick-actions" style={{ marginTop: "1.5rem" }}>{filters.map((f) => <button key={f} className="chip" data-active={filter === f ? "true" : "false"} onClick={() => setFilter(f)}>{f}</button>)}</div><div className="card-grid" style={{ marginTop: "1.5rem" }}>{visible.length === 0 ? <p className="empty-note">No modules match this filter.</p> : visible.map((m) => <div key={m.id} className="panel" style={{ padding: "1.25rem" }}><p style={{ fontWeight: 500 }}>{m.skill}</p><span className="chip-static" style={{ marginTop: ".4rem", display: "inline-block" }}>{m.level}</span><p style={{ marginTop: ".85rem", fontSize: ".85rem", color: "var(--muted-foreground)" }}>{m.description}</p><button className={`btn btn-sm ${m.completed ? "btn-secondary" : "btn-primary"}`} style={{ marginTop: "1.1rem" }} onClick={() => toggleComplete(m.id)}>{m.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}{m.completed ? "Completed" : "Mark as complete"}</button></div>)}</div></div>;
}
