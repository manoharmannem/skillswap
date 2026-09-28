import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Download } from "lucide-react";
import { jsPDF } from "jspdf";

const filters = ["All", "Not started", "Completed"];

const allCompleted = (items = []) => items.length > 0 && items.every((item) => item.completed);
const countCompleted = (items = []) => items.filter((item) => item.completed).length;


export default function Practice() {
  const { user, updatePracticeModules } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [skillId, setSkillId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [moduleId, setModuleId] = useState(null);
  const [lessonId, setLessonId] = useState(null);

  const skills = user?.practiceModules || [];
  const selectedSkill = skills.find((item) => item.id === skillId) || null;
  const selectedCategory = selectedSkill?.categories?.find((item) => item.id === categoryId) || null;
  const selectedModule = selectedCategory?.modules?.find((item) => item.id === moduleId) || null;
  const selectedLesson = selectedModule?.lessons?.find((item) => item.id === lessonId) || null;


  useEffect(() => {
    if (skillId && !selectedSkill) {
      setSkillId(skills[0]?.id || null);
      setCategoryId(null);
      setModuleId(null);
      setLessonId(null);
    }
  }, [skillId, selectedSkill, skills]);

  function resetFrom(level) {
    if (level === "skill") {
      setCategoryId(null);
      setModuleId(null);
      setLessonId(null);
    }
    if (level === "category") {
      setModuleId(null);
      setLessonId(null);
    }
    if (level === "module") setLessonId(null);
  }

  async function updateLessonCompletion(lesson, completed) {
    if (!selectedSkill || !selectedCategory || !selectedModule) return;

    const nextModules = skills.map((skill) => {
      if (skill.id !== selectedSkill.id) return skill;

      return {
        ...skill,
        categories: skill.categories.map((category) => {
          if (category.id !== selectedCategory.id) return category;

          return {
            ...category,
            modules: category.modules.map((module) => {
              if (module.id !== selectedModule.id) return module;

              const lessons = module.lessons.map((item) =>
                item.id === lesson.id ? { ...item, completed } : item
              );
              const nextModule = { ...module, lessons, completed: allCompleted(lessons) };

              return nextModule;
            }),
          };
        }).map((category) => {
          const completedModules = allCompleted(category.modules);
          return { ...category, completed: completedModules };
        }),
      };
    }).map((skill) => ({
      ...skill,
      completed: allCompleted(skill.categories),
    }));

    const result = await updatePracticeModules(nextModules);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(completed ? "Lesson completed." : "Lesson reopened.");
  }

  function downloadLessonPdf() {
    if (!selectedLesson) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 44;
    const width = 595 - margin * 2;
    let y = 55;

    const write = (text, size = 11, gap = 12) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(text || ""), width);
      if (y + lines.length * (size + 4) > 770) {
        doc.addPage();
        y = 50;
      }
      doc.text(lines, margin, y);
      y += lines.length * (size + 4) + gap;
    };

    doc.setFont("helvetica", "bold");
    write(selectedLesson.title, 20, 10);
    doc.setFont("helvetica", "normal");
    write(`${selectedSkill?.skill} → ${selectedCategory?.name} → ${selectedModule?.title}`, 10, 16);
    write(selectedLesson.lesson?.intro, 11, 12);
    (selectedLesson.lesson?.sections || []).forEach((section) => {
      doc.setFont("helvetica", "bold");
      write(section.heading, 13, 5);
      doc.setFont("helvetica", "normal");
      write(section.body, 10.5, 12);
    });
    doc.setFont("helvetica", "bold");
    write("Example / practice", 13, 5);
    doc.setFont("helvetica", "normal");
    write(selectedLesson.lesson?.example, 9.5, 12);
    doc.save(`skillswap-${selectedLesson.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
  }

  const visibleSkills = useMemo(() => skills.filter((skill) => {
    const completed = allCompleted(skill.categories || []);
    if (filter === "Completed") return completed;
    if (filter === "Not started") return !completed;
    return true;
  }), [skills, filter]);

  if (!skills.length) {
    return (
      <div>
        <p className="page-eyebrow">Learn step by step</p>
        <h1 className="page-title">Practice</h1>
        <p className="page-sub">Choose skills you want to learn in your profile to create a structured learning path.</p>
        <div className="panel" style={{ marginTop: "1.5rem" }}>No learning skills selected yet.</div>
      </div>
    );
  }

  return (
    <div>
      <p className="page-eyebrow">Structured learning paths</p>
      <h1 className="page-title">Practice</h1>
      <p className="page-sub">
        Choose a skill, then a language or category, then a module, then a complete lesson. Your progress is saved to your SkillSwap account.
      </p>

      <div className="quick-actions" style={{ marginTop: "1.5rem" }}>
        {filters.map((name) => (
          <button key={name} className="chip" data-active={filter === name ? "true" : "false"} onClick={() => setFilter(name)}>
            {name}
          </button>
        ))}
      </div>

      {!selectedSkill ? (
        <div className="card-grid" style={{ marginTop: "1.5rem" }}>
          {visibleSkills.map((skill) => (
            <button key={skill.id} className="panel" style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border)" }} onClick={() => { setSkillId(skill.id); resetFrom("skill"); }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <strong style={{ fontSize: "1.08rem" }}>{skill.skill}</strong>
                  <p className="page-sub" style={{ margin: ".45rem 0 0" }}>{skill.description}</p>
                </div>
                <ChevronRight />
              </div>
              <div style={{ marginTop: ".9rem", fontSize: ".82rem", color: "var(--muted-foreground)" }}>
                {countCompleted(skill.categories || [])}/{skill.categories?.length || 0} categories completed
              </div>
            </button>
          ))}
        </div>
      ) : !selectedCategory ? (
        <section style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-secondary" onClick={() => { setSkillId(null); resetFrom("skill"); }}><ArrowLeft size={16} /> All skills</button>
          <div className="panel" style={{ marginTop: "1rem" }}>
            <p className="page-eyebrow">{selectedSkill.skill}</p>
            <h2 style={{ margin: 0 }}>Choose what you want to learn</h2>
            <p className="page-sub">For coding, this is where C, C++, Java, Python and JavaScript appear. Other skills have their own relevant learning categories.</p>
          </div>
          <div className="card-grid" style={{ marginTop: "1rem" }}>
            {selectedSkill.categories.map((category) => (
              <button key={category.id} className="panel" style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border)" }} onClick={() => { setCategoryId(category.id); resetFrom("category"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <strong style={{ fontSize: "1.05rem" }}>{category.name}</strong>
                    <p className="page-sub" style={{ margin: ".4rem 0 0" }}>{category.description}</p>
                  </div>
                  <ChevronRight />
                </div>
                <div style={{ marginTop: ".8rem", fontSize: ".82rem", color: "var(--muted-foreground)" }}>5 modules · {countCompleted(category.modules || [])}/5 completed</div>
              </button>
            ))}
          </div>
        </section>
      ) : !selectedModule ? (
        <section style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-secondary" onClick={() => { setCategoryId(null); resetFrom("category"); }}><ArrowLeft size={16} /> {selectedSkill.skill}</button>
          <div className="panel" style={{ marginTop: "1rem" }}>
            <p className="page-eyebrow">{selectedCategory.name}</p>
            <h2 style={{ margin: 0 }}>{selectedSkill.skill} · Learning path</h2>
            <p className="page-sub" style={{ marginBottom: 0 }}>Five modules. Open a module to see its units/lessons, then open a lesson to study it from beginning to end.</p>
          </div>
          <div className="card-grid" style={{ marginTop: "1rem" }}>
            {selectedCategory.modules.map((module, index) => (
              <button key={module.id} className="panel" style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border)" }} onClick={() => { setModuleId(module.id); resetFrom("module"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <span className="chip-static">Module {index + 1}</span>
                    <h3 style={{ margin: ".65rem 0 .35rem" }}>{module.title.replace(/^Module \d+ — /, "")}</h3>
                    <p className="page-sub" style={{ margin: 0 }}>{module.description}</p>
                  </div>
                  <ChevronRight />
                </div>
                <div style={{ marginTop: ".85rem", fontSize: ".82rem", color: "var(--muted-foreground)" }}>
                  {countCompleted(module.lessons || [])}/{module.lessons?.length || 0} lessons completed
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : !selectedLesson ? (
        <section style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-secondary" onClick={() => { setModuleId(null); resetFrom("module"); }}><ArrowLeft size={16} /> {selectedCategory.name}</button>
          <div className="panel" style={{ marginTop: "1rem" }}>
            <p className="page-eyebrow">{selectedCategory.name}</p>
            <h2 style={{ margin: 0 }}>{selectedModule.title}</h2>
            <p className="page-sub" style={{ marginBottom: 0 }}>{selectedModule.description}</p>
          </div>
          <div style={{ display: "grid", gap: ".8rem", marginTop: "1rem" }}>
            {selectedModule.lessons.map((lesson, index) => (
              <button key={lesson.id} className="panel" style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }} onClick={() => setLessonId(lesson.id)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: ".9rem" }}>
                  {lesson.completed ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
                  <div>
                    <div style={{ fontSize: ".74rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".08em" }}>Unit {index + 1}</div>
                    <strong>{lesson.title}</strong>
                    <p className="page-sub" style={{ margin: ".25rem 0 0" }}>{lesson.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-secondary" onClick={() => setLessonId(null)}><ArrowLeft size={16} /> All lessons</button>
          <article className="panel" style={{ marginTop: "1rem", maxWidth: "900px", padding: "clamp(1.25rem, 4vw, 3rem)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <p className="page-eyebrow">{selectedSkill.skill} · {selectedCategory.name} · {selectedModule.title}</p>
                <div style={{ fontSize: ".74rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".08em" }}>Complete lesson</div>
                <h2 style={{ margin: ".35rem 0 .7rem" }}>{selectedLesson.title}</h2>
              </div>
              <button className="btn btn-secondary" onClick={downloadLessonPdf}><Download size={15} /> PDF</button>
            </div>

            <div style={{ lineHeight: 1.8 }}>
              <p>{selectedLesson.lesson?.intro}</p>
              {(selectedLesson.lesson?.sections || []).map((section, index) => (
                <section key={index} style={{ marginTop: "1.5rem" }}>
                  <h3>{section.heading}</h3>
                  <p style={{ whiteSpace: "pre-wrap" }}>{section.body}</p>
                </section>
              ))}
              <div style={{ marginTop: "1.5rem" }}>
                <h3>Example / practice</h3>
                <pre style={{ overflowX: "auto", padding: "1rem", borderRadius: "12px", background: "var(--surface-muted, #f5f7fa)", whiteSpace: "pre-wrap" }}>{selectedLesson.lesson?.example}</pre>
              </div>

              {(selectedLesson.lesson?.sources || []).length > 0 && (
                <div style={{ marginTop: "1.75rem", padding: "1rem", borderRadius: "12px", background: "var(--surface-muted, #f5f7fa)" }}>
                  <h3 style={{ marginTop: 0 }}>Further learning</h3>
                  <p className="page-sub" style={{ marginTop: ".25rem" }}>
                    This lesson is original SkillSwap content informed by the learning references below. Use them for deeper study.
                  </p>
                  <ul style={{ margin: ".75rem 0 0", paddingLeft: "1.2rem" }}>
                    {selectedLesson.lesson.sources.map((source) => (
                      <li key={source.url} style={{ marginBottom: ".45rem" }}>
                        <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem", padding: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <strong>{selectedLesson.completed ? "Lesson completed ✓" : "Finish this lesson when you can explain and practise the concept."}</strong>
                <p className="page-sub" style={{ margin: ".25rem 0 0" }}>Completion is saved to your SkillSwap account.</p>
              </div>
              <button className="btn btn-primary" onClick={() => updateLessonCompletion(selectedLesson, !selectedLesson.completed)}>
                {selectedLesson.completed ? "Mark as incomplete" : "Mark lesson complete"}
              </button>
            </div>
          </article>
        </section>
      )}

    </div>
  );
}
