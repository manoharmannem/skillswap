import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";

const filters = ["All", "Not started", "Completed"];

export default function Practice() {
  const { user, updatePracticeModules } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [openSkill, setOpenSkill] = useState(null);

  const modules = user?.practiceModules || [];

  const visible = modules.filter((m) => {
    const completed = Array.isArray(m.topics) && m.topics.length
      ? m.topics.every((topic) => topic.completed)
      : Boolean(m.completed);
    return filter === "Completed" ? completed : filter === "Not started" ? !completed : true;
  });

  async function toggleTopic(moduleId, topicId) {
    const updated = modules.map((module) => {
      if (module.id !== moduleId) return module;
      const topics = (module.topics || []).map((topic) =>
        topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
      );
      return { ...module, topics, completed: topics.length > 0 && topics.every((topic) => topic.completed) };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) toast.error(result.error);
    else toast.success("Practice progress saved");
  }

  return (
    <div>
      <p className="page-eyebrow">Learn step by step</p>
      <h1 className="page-title">Practice</h1>
      <p className="page-sub">
        Only the skills you selected under “Skills you want to learn” appear here.
        Open a skill to see its modules and complete each topic as you learn.
      </p>

      <div className="quick-actions" style={{ marginTop: "1.5rem" }}>
        {filters.map((f) => (
          <button key={f} className="chip" data-active={filter === f ? "true" : "false"} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="card-grid" style={{ marginTop: "1.5rem" }}>
        {visible.length === 0 ? (
          <p className="empty-note">
            {modules.length ? "No skills match this filter." : "Select a skill you want to learn in your profile to start practising."}
          </p>
        ) : visible.map((m) => {
          const topics = m.topics || [];
          const completedCount = topics.filter((topic) => topic.completed).length;
          const skillCompleted = topics.length > 0 ? completedCount === topics.length : Boolean(m.completed);
          const isOpen = openSkill === m.id;

          return (
            <div key={m.id} className="panel" style={{ padding: "1.25rem" }}>
              <button type="button" onClick={() => setOpenSkill(isOpen ? null : m.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", textAlign: "left", background: "none", border: 0, padding: 0, color: "inherit", cursor: "pointer" }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: "1.05rem" }}>{m.skill}</span>
                  <span className="chip-static" style={{ marginTop: ".45rem", display: "inline-block" }}>{m.level}</span>
                  <span style={{ display: "block", marginTop: ".7rem", fontSize: ".84rem", color: "var(--muted-foreground)" }}>{m.description}</span>
                </span>
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: ".45rem" }}>
                  <span className={skillCompleted ? "badge badge-completed" : "badge badge-upcoming"}>
                    {topics.length ? (completedCount + "/" + topics.length) : "0%"}
                  </span>
                  <ChevronDown size={18} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </span>
              </button>

              {isOpen && (
                <div style={{ marginTop: "1.15rem", borderTop: "1px solid var(--border)", paddingTop: ".9rem" }}>
                  {topics.map((topic) => (
                    <button key={topic.id} type="button" onClick={() => toggleTopic(m.id, topic.id)}
                      style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: ".7rem", padding: ".85rem .15rem", textAlign: "left", background: "none", border: 0, borderBottom: "1px solid var(--border)", color: "inherit", cursor: "pointer" }}>
                      {topic.completed ? <CheckCircle2 size={19} style={{ flexShrink: 0 }} /> : <Circle size={19} style={{ flexShrink: 0 }} />}
                      <span>
                        <span style={{ display: "block", fontWeight: 500, textDecoration: topic.completed ? "line-through" : "none" }}>{topic.title}</span>
                        <span style={{ display: "block", marginTop: ".25rem", fontSize: ".78rem", color: "var(--muted-foreground)" }}>{topic.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
