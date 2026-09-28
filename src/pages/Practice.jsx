import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { CheckCircle2, ChevronDown, Circle, FileText, LockKeyhole, X, Download } from "lucide-react";
import { jsPDF } from "jspdf";

const filters = ["All", "Not started", "Completed"];

export default function Practice() {
  const { user, updatePracticeModules } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [openSkill, setOpenSkill] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [canComplete, setCanComplete] = useState(false);
  const lessonRef = useRef(null);

  const modules = user?.practiceModules || [];

  const visible = modules.filter((m) => {
    const completed = Array.isArray(m.topics) && m.topics.length
      ? m.topics.every((topic) => topic.completed)
      : Boolean(m.completed);
    return filter === "Completed" ? completed : filter === "Not started" ? !completed : true;
  });

  useEffect(() => {
    if (!selectedTopic) return undefined;
    setCanComplete(Boolean(selectedTopic.completed));
    const node = lessonRef.current;
    if (!node) return undefined;

    const onScroll = () => {
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 24;
      if (atBottom) setCanComplete(true);
    };

    node.addEventListener("scroll", onScroll);
    onScroll();
    return () => node.removeEventListener("scroll", onScroll);
  }, [selectedTopic]);

  function openLesson(module, topic) {
    setOpenSkill(module.id);
    setSelectedTopic({
      moduleId: module.id,
      skill: module.skill,
      moduleTitle: module.description,
      ...topic,
    });
    setCanComplete(Boolean(topic.completed));
  }

  function downloadLessonPdf() {
    if (!selectedTopic) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(selectedTopic.title, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Document • Original lesson content", margin, y);
    y += 24;

    const writeBlock = (text, size = 11, gap = 14) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(text || ""), width);
      if (y + lines.length * (size + 3) > 770) {
        doc.addPage();
        y = 50;
      }
      doc.text(lines, margin, y);
      y += lines.length * (size + 3) + gap;
    };

    writeBlock("Introduction", 13, 8);
    writeBlock(selectedLesson.intro, 11, 14);

    (selectedLesson.sections || []).forEach((section) => {
      writeBlock(section.heading, 13, 8);
      writeBlock(section.body, 11, 14);
    });

    if (selectedLesson.example) {
      writeBlock("Example", 13, 8);
      writeBlock(selectedLesson.example, 9, 16);
    }

    writeBlock("Completion checkpoint", 13, 8);
    writeBlock("Read the lesson, try the example yourself, and complete the topic in SkillSwap after reaching the end of the lesson.", 11, 10);

    const safeName = selectedTopic.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "lesson"}.pdf`);
  }

  async function completeTopic() {
    if (!selectedTopic || !canComplete) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedTopic.moduleId) return module;
      const topics = (module.topics || []).map((topic) =>
        topic.id === selectedTopic.id ? { ...topic, completed: true } : topic
      );
      return { ...module, topics, completed: topics.length > 0 && topics.every((topic) => topic.completed) };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const updatedModule = updated.find((module) => module.id === selectedTopic.moduleId);
    const moduleCompleted = updatedModule?.topics?.length > 0 && updatedModule.topics.every((topic) => topic.completed);

    setSelectedTopic((current) => current ? { ...current, completed: true } : current);
    toast.success(moduleCompleted ? "Module completed! You finished every topic in this skill." : "Topic completed. Continue to the next lesson.");
  }

  const selectedLesson = useMemo(() => selectedTopic?.lesson || {
    intro: "Read this lesson from top to bottom, then complete the checkpoint.",
    sections: [],
    example: "",
  }, [selectedTopic]);

  return (
    <div>
      <p className="page-eyebrow">Learn step by step</p>
      <h1 className="page-title">Practice</h1>
      <p className="page-sub">
        Only the skills you selected under “Skills you want to learn” appear here.
        Open a skill, choose a topic, read the lesson document, and complete it only after reaching the end.
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
              <button
                type="button"
                onClick={() => setOpenSkill(isOpen ? null : m.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", textAlign: "left", background: "none", border: 0, padding: 0, color: "inherit", cursor: "pointer" }}
              >
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
                  {topics.map((topic, index) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => openLesson(m, topic)}
                      style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: ".7rem", padding: ".9rem .15rem", textAlign: "left", background: "none", border: 0, borderBottom: "1px solid var(--border)", color: "inherit", cursor: "pointer" }}
                    >
                      {topic.completed ? <CheckCircle2 size={19} style={{ flexShrink: 0 }} /> : <Circle size={19} style={{ flexShrink: 0 }} />}
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: "block", fontWeight: 600 }}>{index + 1}. {topic.title}</span>
                        <span style={{ display: "block", marginTop: ".25rem", fontSize: ".78rem", color: "var(--muted-foreground)" }}>{topic.description}</span>
                      </span>
                      <FileText size={17} style={{ flexShrink: 0, opacity: .65 }} />
                    </button>
                  ))}
                  {skillCompleted && (
                    <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface-muted, #f6f8fb)" }}>
                      <strong>🎉 Module completed!</strong>
                      <div style={{ marginTop: ".25rem", fontSize: ".85rem", color: "var(--muted-foreground)" }}>
                        You finished every topic in the {m.skill} learning path.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTopic && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedTopic.title}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,18,30,.68)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(event) => { if (event.target === event.currentTarget) setSelectedTopic(null); }}
        >
          <div style={{ width: "min(900px, 100%)", height: "min(88vh, 820px)", background: "#eef1f5", borderRadius: "16px", boxShadow: "0 24px 80px rgba(0,0,0,.25)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: ".8rem 1rem", background: "#ffffff", borderBottom: "1px solid #d8dde5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem", minWidth: 0 }}>
                <FileText size={18} />
                <span style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedTopic.skill} • Lesson</span>
              </div>
              <button type="button" onClick={() => setSelectedTopic(null)} aria-label="Close lesson" style={{ border: 0, background: "transparent", cursor: "pointer", padding: ".3rem" }}><X size={20} /></button>
            </div>

            <div ref={lessonRef} style={{ overflowY: "auto", flex: 1, padding: "2rem 1rem" }}>
              <article style={{ width: "min(720px, 100%)", minHeight: "100%", margin: "0 auto", background: "#fff", padding: "clamp(1.5rem, 4vw, 3rem)", boxShadow: "0 5px 22px rgba(20,30,45,.10)", color: "#182334" }}>
                <div style={{ fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#667085", marginBottom: ".7rem" }}>SkillSwap Learning Document</div>
                <h2 style={{ margin: 0, fontSize: "clamp(1.5rem, 4vw, 2.1rem)" }}>{selectedTopic.title}</h2>
                <div style={{ marginTop: ".6rem", fontSize: ".85rem", color: "#667085" }}>Skill: {selectedTopic.skill} · Read the complete lesson before finishing</div>

                <div style={{ marginTop: "1.8rem", lineHeight: 1.75 }}>
                  <p><strong>Introduction</strong></p>
                  <p>{selectedLesson.intro}</p>
                  {(selectedLesson.sections || []).map((section) => (
                    <section key={section.heading} style={{ marginTop: "1.5rem" }}>
                      <h3 style={{ fontSize: "1.05rem", marginBottom: ".45rem" }}>{section.heading}</h3>
                      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{section.body}</p>
                    </section>
                  ))}

                  {selectedLesson.example && (
                    <section style={{ marginTop: "1.5rem" }}>
                      <h3 style={{ fontSize: "1.05rem" }}>Example</h3>
                      <pre style={{ overflowX: "auto", padding: "1rem", borderRadius: "10px", background: "#f4f6f8", fontSize: ".82rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selectedLesson.example}</pre>
                    </section>
                  )}

                  <section style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #d8dde5", borderRadius: "12px", background: "#fafbfc" }}>
                    <h3 style={{ fontSize: "1.05rem", marginTop: 0 }}>End-of-topic checkpoint</h3>
                    <p style={{ marginBottom: 0 }}>Explain the concept in your own words and try the example yourself. The completion button unlocks after you scroll to the bottom of this document.</p>
                  </section>

                  <div style={{ height: "220px" }} />
                </div>
              </article>
            </div>

            <div style={{ padding: ".8rem 1rem", background: "#ffffff", borderTop: "1px solid #d8dde5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".8rem", color: "#667085" }}>
                <LockKeyhole size={15} />
                {canComplete ? "Lesson read to the end" : "Scroll to the end to unlock completion"}
              </div>
              <div style={{ display: "flex", gap: ".55rem", alignItems: "center" }}>
                <button type="button" className="btn btn-secondary" onClick={downloadLessonPdf}>
                  <Download size={15} /> PDF
                </button>
                <button
                  type="button"
                  disabled={!canComplete || selectedTopic.completed}
                  onClick={completeTopic}
                  className="btn btn-primary"
                >
                  {selectedTopic.completed ? "Topic completed ✓" : "Mark topic complete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
