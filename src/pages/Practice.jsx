import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { ChevronDown, FileText, X, Download } from "lucide-react";
import { jsPDF } from "jspdf";

const filters = ["All", "Not started", "Completed"];

export default function Practice() {
  const { user, updatePracticeModules } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [openSkill, setOpenSkill] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
    const node = lessonRef.current;
    if (!node) return undefined;

    const onScroll = () => {
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 24;
      if (atBottom) {\n        setCanComplete(true);\n        if (!selectedModule.completed) completeModule();\n      }
    };

    node.addEventListener("scroll", onScroll);
    onScroll();
    return () => node.removeEventListener("scroll", onScroll);
  }, [selectedModule]);

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }
mport { useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
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

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }
              {isOpen && (
                <div style={{ marginTop: "1.15rem", borderTop: "1px solid var(--border)", paddingTop: ".9rem" }}>
                  <button type="button" className="btn btn-primary" onClick={() => openModule(m)} style={{ width: "100%" }}>
                    <FileText size={16} /> Open learning module
                  </button>
                  <div style={{ marginTop: ".8rem", fontSize: ".8rem", color: "var(--muted-foreground)" }}>
                    {completedCount}/{topics.length} topics completed. Open the module to read every topic in one continuous document.
                  </div>
                  {skillCompleted && (
                    <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface-muted, #f6f8fb)" }}>
                      <strong>🎉 Module completed!</strong>
                      <div style={{ marginTop: ".25rem", fontSize: ".85rem", color: "var(--muted-foreground)" }}>
                        You finished every topic in the {m.skill} learning path.
                      </div>
                    </div>
                  )}
                </div>
              )}ect, useMemo, useRef, useState } from "react";
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
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
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

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }
mport { useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
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

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }
      {selectedModule && (
        <div role="dialog" aria-modal="true" aria-label={selectedModule.skill + " learning module"}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,18,30,.68)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(event) => { if (event.target === event.currentTarget) setSelectedModule(null); }}>
          <div style={{ width: "min(900px, 100%)", height: "min(90vh, 850px)", background: "#eef1f5", borderRadius: "16px", boxShadow: "0 24px 80px rgba(0,0,0,.25)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: ".8rem 1rem", background: "#fff", borderBottom: "1px solid #d8dde5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div><FileText size={18} style={{ verticalAlign: "middle", marginRight: ".5rem" }} /><strong>{selectedModule.skill} — Learning Module</strong></div>
              <button type="button" onClick={() => setSelectedModule(null)} aria-label="Close module" style={{ border: 0, background: "transparent", cursor: "pointer", padding: ".3rem" }}><X size={20} /></button>
            </div>
            <div ref={lessonRef} style={{ overflowY: "auto", flex: 1, padding: "2rem 1rem" }}>
              <article style={{ width: "min(720px, 100%)", margin: "0 auto", background: "#fff", padding: "clamp(1.5rem, 4vw, 3rem)", boxShadow: "0 5px 22px rgba(20,30,45,.10)", color: "#182334" }}>
                <div style={{ fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#667085" }}>SkillSwap Learning Document</div>
                <h2 style={{ margin: ".5rem 0 0" }}>{selectedModule.skill}</h2>
                <p style={{ color: "#667085" }}>{selectedModule.description}</p>
                {(selectedModule.topics || []).map((topic, index) => (
                  <section key={topic.id} style={{ padding: "1.5rem 0", borderBottom: "1px solid #e1e5ea", lineHeight: 1.75 }}>
                    <div style={{ fontSize: ".75rem", textTransform: "uppercase", color: "#667085", letterSpacing: ".08em" }}>Topic {index + 1}</div>
                    <h3 style={{ margin: ".35rem 0 .7rem" }}>{topic.title}</h3>
                    <p>{topic.lesson?.intro || topic.description}</p>
                    {(topic.lesson?.sections || []).map((section) => (
                      <div key={section.heading} style={{ marginTop: "1.2rem" }}>
                        <h4 style={{ marginBottom: ".4rem" }}>{section.heading}</h4>
                        <p style={{ whiteSpace: "pre-wrap" }}>{section.body}</p>
                      </div>
                    ))}
                    {topic.lesson?.example && <pre style={{ overflowX: "auto", padding: "1rem", borderRadius: "10px", background: "#f4f6f8", fontSize: ".82rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{topic.lesson.example}</pre>}
                  </section>
                ))}
                <section style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #d8dde5", borderRadius: "12px", background: "#fafbfc" }}>
                  <h3 style={{ marginTop: 0 }}>End of module</h3>
                  <p style={{ marginBottom: 0 }}>You have reached the end. The module will be marked complete automatically after you scroll to this point.</p>
                </section>
                <div style={{ height: "220px" }} />
              </article>
            </div>
            <div style={{ padding: ".8rem 1rem", background: "#fff", borderTop: "1px solid #d8dde5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".75rem" }}>
              <div style={{ fontSize: ".8rem", color: "#667085" }}>{canComplete ? "✓ You reached the end of the module" : "Scroll through all topics to the end"}</div>
              <div style={{ display: "flex", gap: ".55rem" }}>
                <button type="button" className="btn btn-secondary" onClick={downloadModulePdf}><Download size={15} /> PDF</button>
                <button type="button" className="btn btn-primary" disabled={!canComplete || selectedModule.completed} onClick={completeModule}>
                  {selectedModule.completed ? "Module completed ✓" : "Complete module"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
{ useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
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

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }
mport { useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
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

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }
              {isOpen && (
                <div style={{ marginTop: "1.15rem", borderTop: "1px solid var(--border)", paddingTop: ".9rem" }}>
                  <button type="button" className="btn btn-primary" onClick={() => openModule(m)} style={{ width: "100%" }}>
                    <FileText size={16} /> Open learning module
                  </button>
                  <div style={{ marginTop: ".8rem", fontSize: ".8rem", color: "var(--muted-foreground)" }}>
                    {completedCount}/{topics.length} topics completed. Open the module to read every topic in one continuous document.
                  </div>
                  {skillCompleted && (
                    <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface-muted, #f6f8fb)" }}>
                      <strong>🎉 Module completed!</strong>
                      <div style={{ marginTop: ".25rem", fontSize: ".85rem", color: "var(--muted-foreground)" }}>
                        You finished every topic in the {m.skill} learning path.
                      </div>
                    </div>
                  )}
                </div>
              )}ect, useMemo, useRef, useState } from "react";
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
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
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

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }
mport { useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedModule, setSelectedModule] = useState(null);
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
    if (!selectedModule) return undefined;
    setCanComplete(Boolean(selectedModule.completed));
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

  function openModule(module) {
    setSelectedModule(module);
    setCanComplete(Boolean(module.completed));
    setOpenSkill(module.id);
  }

  function downloadModulePdf() {
    if (!selectedModule) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 56;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(selectedModule.skill, margin, y, { maxWidth: width });
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SkillSwap Learning Module • Original lesson content", margin, y);
    y += 28;

    (selectedModule.topics || []).forEach((topic, index) => {
      writeBlock(`${index + 1}. ${topic.title}`, 15, 8);
      writeBlock(topic.lesson?.intro || topic.description, 11, 10);
      (topic.lesson?.sections || []).forEach((section) => {
        writeBlock(section.heading, 12, 6);
        writeBlock(section.body, 10.5, 12);
      });
      if (topic.lesson?.example) {
        writeBlock("Example", 12, 6);
        writeBlock(topic.lesson.example, 9, 14);
      }
    });

    writeBlock("Module completion", 14, 8);
    writeBlock("Read the complete module, work through the examples, and finish the module in SkillSwap after reaching the end.", 11, 10);

    const safeName = selectedModule.skill.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    doc.save(`skillswap-${safeName || "module"}-module.pdf`);
  }

  async function completeModule() {
    if (!selectedModule || !canComplete || selectedModule.completed) return;

    const updated = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;
      const topics = (module.topics || []).map((topic) => ({ ...topic, completed: true }));
      return { ...module, topics, completed: true };
    });

    const result = await updatePracticeModules(updated);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const finished = updated.find((module) => module.id === selectedModule.id);
    setSelectedModule(finished);
    toast.success(`Module completed! You finished every topic in ${finished?.skill || "this skill"}.`);
  }

