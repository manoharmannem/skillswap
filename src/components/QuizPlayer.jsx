import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export default function QuizPlayer({ quiz, onFinish, onExit }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const question = quiz.questions[current];
  const isLast = current === quiz.questions.length - 1;

  function handleSelect(index) {
    if (selected !== null) return;
    setSelected(index);
    setAnswers((prev) => { const next = [...prev]; next[current] = index; return next; });
  }
  function handleNext() {
    if (selected === null) return;
    if (isLast) return onFinish(0, quiz.questions.length, answers);
    setCurrent((c) => c + 1);
    setSelected(null);
  }

  return <div className="panel" style={{ padding: "1.75rem" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <button className="btn btn-ghost btn-sm" onClick={onExit}><ChevronLeft size={16} /> Exit quiz</button>
      <p style={{ fontSize: ".8rem", color: "var(--muted-foreground)" }}>Question {current + 1} of {quiz.questions.length}</p>
    </div>
    <div className="progress-track" style={{ marginTop: "1rem" }}><div className="progress-fill" style={{ width: `${((current + (selected !== null ? 1 : 0)) / quiz.questions.length) * 100}%` }} /></div>
    <div style={{ marginTop: "1.5rem" }}><span className="chip-static">{quiz.skill}</span><h2 style={{ marginTop: ".9rem", fontSize: "1.25rem" }}>{question.question}</h2></div>
    <div style={{ marginTop: "1.25rem" }}>{question.options.map((opt, i) => <button key={i} type="button" className={`quiz-option ${selected === i ? "selected" : ""}`} disabled={selected !== null} onClick={() => handleSelect(i)}>{opt}</button>)}</div>
    {selected !== null && <p style={{ marginTop: ".8rem", color: "var(--muted-foreground)", fontSize: ".85rem" }}>Your answer is saved. The correct answer is hidden until the creator reviews the result.</p>}
    <button className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={selected === null} onClick={handleNext}>{isLast ? "Submit test" : "Next question"}</button>
  </div>;
}
