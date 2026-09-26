import { useEffect, useMemo, useState } from "react";
import { Award, Edit3, Plus, Trash2, UserRound, X } from "lucide-react";
import QuizPlayer from "../components/QuizPlayer.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const emptyQuestion = () => ({ question: "", options: ["", "", "", ""], answerIndex: 0 });

export default function Quizzes() {
  const { user, recordQuizScore } = useAuth();
  const { acceptedConnections } = useConnections();
  const toast = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewId, setReviewId] = useState(null);

  async function load() { try { const d = await api("/api/quizzes"); setQuizzes(d.quizzes || []); } catch (e) { toast.error(e.message); } }
  useEffect(() => { load(); }, []);

  const partners = useMemo(() => acceptedConnections.map((c) => c.fromEmail === user?.email ? c.toUser : c.fromUser).filter(Boolean), [acceptedConnections, user]);
  const mine = quizzes.filter((q) => q.creator?._id === user?.id || q.creator?.email === user?.email);
  const assigned = quizzes.filter((q) => q.assignedTo?._id === user?.id || q.assignedTo?.email === user?.email);

  function newQuiz() {
    setEditing({ title: "", skill: user?.skills?.[0] || "", assignedTo: partners[0]?._id || partners[0]?.id || "", questions: [emptyQuestion()] });
    setShowEditor(true);
  }
  function editQuiz(q) {
    setEditing({ _id: q._id, title: q.title, skill: q.skill, assignedTo: q.assignedTo?._id, questions: q.questions.map((x) => ({ question: x.question, options: [...x.options], answerIndex: x.answerIndex })) });
    setShowEditor(true);
  }
  function updateQuestion(index, patch) { setEditing((e) => ({ ...e, questions: e.questions.map((q, i) => i === index ? { ...q, ...patch } : q) })); }
  function updateOption(qi, oi, value) { setEditing((e) => ({ ...e, questions: e.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? value : o) } : q) })); }
  async function saveQuiz(e) {
    e.preventDefault();
    if (!editing?.assignedTo) return toast.error("Choose a connected participant.");
    setSaving(true);
    try {
      const path = editing._id ? `/api/quizzes/${editing._id}` : "/api/quizzes";
      const method = editing._id ? "PUT" : "POST";
      await api(path, { method, body: JSON.stringify(editing) });
      toast.success(editing._id ? "Quiz updated" : "Quiz assigned — email notification sent when SMTP is configured");
      setShowEditor(false); setEditing(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  }
  async function removeQuiz(id) { if (!window.confirm("Delete this quiz?")) return; try { await api(`/api/quizzes/${id}`, { method: "DELETE" }); toast.success("Quiz deleted"); load(); } catch (e) { toast.error(e.message); } }
  async function handleFinish(_score, _total, answers) {
    const data = await recordQuizScore(activeQuiz._id, answers);
    if (data?.error) return toast.error(data.error);
    setResult({ quiz: activeQuiz, score: data.score, total: data.total, creditGain: data.creditGain }); setActiveQuiz(null); await load();
  }

  if (activeQuiz) return <QuizPlayer quiz={activeQuiz} onFinish={handleFinish} onExit={() => setActiveQuiz(null)} />;
  if (result) return <div className="panel" style={{ padding: "2rem", textAlign: "center" }}><Award size={40} color="var(--primary)" style={{ margin: "0 auto" }} /><h2 style={{ marginTop: "1rem", fontSize: "1.5rem" }}>{result.quiz.title} complete</h2><p style={{ marginTop: ".5rem", color: "var(--muted-foreground)" }}>Score <strong style={{ color: "var(--foreground)" }}>{result.score}/{result.total}</strong> · Dashboard credits +{result.creditGain}</p><button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => setResult(null)}>Back to quizzes</button></div>;

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-end" }}><div><p className="page-eyebrow">Private skill tests</p><h1 className="page-title">Quizzes</h1><p className="page-sub">Create a test for an accepted connection. Only the creator sees the answer key and submitted answers.</p></div><button className="btn btn-primary" onClick={newQuiz} disabled={!partners.length}><Plus size={16}/> Create quiz</button></div>
    {!partners.length && <div className="panel" style={{ padding: "1rem", marginTop: "1.25rem" }}>Accept a connection first. Quizzes can only be assigned between connected SkillSwap members.</div>}

    <p className="section-title" style={{ marginTop: "2rem" }}>Assigned to you {assigned.length ? `(${assigned.length})` : ""}</p>
    <div className="card-grid" style={{ marginTop: ".75rem" }}>{assigned.length ? assigned.map((q) => <div key={q._id} className="panel" style={{ padding: "1.25rem" }}><span className="chip-static">{q.skill}</span><h3 style={{ marginTop: ".7rem" }}>{q.title}</h3><p className="list-row-sub" style={{ marginTop: ".4rem" }}>From {q.creator?.name} · {q.questions.length} questions</p><button className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }} onClick={() => setActiveQuiz(q)}>Take test</button></div>) : <p className="empty-note">No quizzes have been assigned to you yet.</p>}</div>

    <p className="section-title" style={{ marginTop: "2rem" }}>Created by you {mine.length ? `(${mine.length})` : ""}</p>
    <div className="card-grid" style={{ marginTop: ".75rem" }}>{mine.length ? mine.map((q) => <div key={q._id} className="panel" style={{ padding: "1.25rem" }}><div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}><span className="chip-static">{q.skill}</span><span className="badge badge-upcoming">{q.status}</span></div><h3 style={{ marginTop: ".7rem" }}>{q.title}</h3><p className="list-row-sub" style={{ marginTop: ".4rem" }}>For {q.assignedTo?.name} · {q.questions.length} questions</p><div style={{ display: "flex", gap: ".5rem", marginTop: "1rem" }}><button className="btn btn-secondary btn-sm" onClick={() => editQuiz(q)}><Edit3 size={15}/> Edit</button><button className="btn btn-danger btn-sm" onClick={() => removeQuiz(q._id)}><Trash2 size={15}/> Delete</button></div>{q.attempts?.length ? <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong style={{ fontSize: ".85rem" }}>Participant result</strong><button className="btn btn-ghost btn-sm" onClick={() => setReviewId(reviewId === q._id ? null : q._id)}>{reviewId === q._id ? "Hide answers" : "View answers"}</button></div>{q.attempts.map((a) => <div key={a._id} style={{ marginTop: ".6rem" }}><p className="list-row-sub">Score: {a.score}/{a.total} · {new Date(a.submittedAt).toLocaleString()}</p>{reviewId === q._id && <div style={{ marginTop: ".6rem" }}>{q.questions.map((question, qi) => <div key={question._id || qi} style={{ marginTop: ".65rem", fontSize: ".82rem" }}><strong>{qi + 1}. {question.question}</strong><p style={{ marginTop: ".2rem" }}>Correct: {question.options[question.answerIndex]}</p><p style={{ color: a.answers[qi] === question.answerIndex ? "var(--success, #15803d)" : "var(--danger, #b91c1c)" }}>Participant: {question.options[a.answers[qi]] || "No answer"}</p></div>)}</div>}</div>)}</div> : <p className="list-row-sub" style={{ marginTop: "1rem" }}>Waiting for the participant to complete the test.</p>}</div>) : <p className="empty-note">Create your first quiz for a connected member.</p>}</div>

    {showEditor && editing && <div className="modal-backdrop"><div className="panel" style={{ width: "min(900px, 94vw)", maxHeight: "90vh", overflow: "auto", padding: "1.5rem" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><p className="page-eyebrow">Quiz builder</p><h2>{editing._id ? "Edit quiz" : "Create quiz"}</h2></div><button className="btn btn-ghost btn-sm" onClick={() => setShowEditor(false)}><X/></button></div><form onSubmit={saveQuiz}><div className="card-grid" style={{ marginTop: "1rem" }}><label className="field"><span className="field-label">Title</span><input className="field-input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="React basics test"/></label><label className="field"><span className="field-label">Skill</span><input className="field-input" value={editing.skill} onChange={(e) => setEditing({ ...editing, skill: e.target.value })} placeholder="React"/></label><label className="field"><span className="field-label">Participant</span><select className="field-select" value={editing.assignedTo} onChange={(e) => setEditing({ ...editing, assignedTo: e.target.value })}><option value="">Choose connected member</option>{partners.map((p) => <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.fullName} · {(p.skills || []).join(", ")}</option>)}</select></label></div>
    {editing.questions.map((q, qi) => <div key={qi} className="panel" style={{ padding: "1rem", marginTop: "1rem", background: "var(--muted)" }}><div style={{ display: "flex", justifyContent: "space-between" }}><strong>Question {qi + 1}</strong>{editing.questions.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => setEditing({ ...editing, questions: editing.questions.filter((_, i) => i !== qi) })}>Remove</button>}</div><input className="field-input" style={{ marginTop: ".7rem" }} value={q.question} onChange={(e) => updateQuestion(qi, { question: e.target.value })} placeholder="Write the question"/>{q.options.map((o, oi) => <div key={oi} style={{ display: "flex", gap: ".5rem", marginTop: ".5rem", alignItems: "center" }}><input type="radio" name={`answer-${qi}`} checked={q.answerIndex === oi} onChange={() => updateQuestion(qi, { answerIndex: oi })} title="Correct answer"/><input className="field-input" value={o} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`}/></div>)}<p className="list-row-sub" style={{ marginTop: ".5rem" }}>Select the radio button beside the correct answer. This answer key is never sent to the participant.</p></div>)}
    <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}><button type="button" className="btn btn-secondary" onClick={() => setEditing({ ...editing, questions: [...editing.questions, emptyQuestion()] })}><Plus size={15}/> Add question</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : editing._id ? "Save changes" : "Create & assign quiz"}</button></div></form></div></div>}
  </div>;
}
