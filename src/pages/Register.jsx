import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { skillOptions } from "../data/mockData.js";

export default function Register() {
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [teaches, setTeaches] = useState([]);
  const [learns, setLearns] = useState([]);
  const [customTeach, setCustomTeach] = useState("");
  const [customLearn, setCustomLearn] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggle(list, setList, skill) {
    const value = skill.trim();
    if (!value) return;
    setList((prev) => prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]);
  }

  function addCustom(value, setValue, list, setList) {
    const skill = value.trim();
    if (!skill) return;
    setList((prev) => prev.includes(skill) ? prev : [...prev, skill]);
    setValue("");
  }

  function validate() {
    if (!fullName.trim()) return "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!teaches.length) return "Choose at least one skill you can teach";
    if (!learns.length) return "Choose at least one skill you want to learn";
    if (!agreed) return "Please agree to the community guidelines";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return toast.error(validationError);
    setSubmitting(true);
    const { error } = await signUp({
      fullName,
      email,
      password,
      skills: teaches,
      learningSkills: learns,
    });
    setSubmitting(false);
    if (error) return toast.error(error);
    toast.success("Account created");
    navigate("/dashboard/explore");
  }

  return (
    <AuthShell
      eyebrow="Join the exchange"
      title="Create your account"
      subtitle="Tell the community what you can teach and what you want to learn."
      footer={<>Already a member? <Link to="/login" className="link-accent">Log in</Link></>}
    >
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Full name</span>
          <input className="field-input" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" className="field-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input type="password" className="field-input" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <div className="field">
          <p className="field-label" style={{ marginBottom: ".5rem" }}>Skills you can teach</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {skillOptions.map((skill) => (
              <button key={skill} type="button" className="chip" data-active={teaches.includes(skill) ? "true" : "false"} onClick={() => toggle(teaches, setTeaches, skill)}>{skill}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".65rem" }}>
            <input className="field-input" placeholder="Add another skill" value={customTeach} onChange={(e) => setCustomTeach(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(customTeach, setCustomTeach, teaches, setTeaches); } }} />
            <button type="button" className="btn btn-secondary" onClick={() => addCustom(customTeach, setCustomTeach, teaches, setTeaches)}>Add</button>
          </div>
        </div>

        <div className="field">
          <p className="field-label" style={{ marginBottom: ".5rem" }}>Skills you want to learn</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {skillOptions.map((skill) => (
              <button key={skill} type="button" className="chip" data-active={learns.includes(skill) ? "true" : "false"} onClick={() => toggle(learns, setLearns, skill)}>{skill}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".65rem" }}>
            <input className="field-input" placeholder="Add another skill" value={customLearn} onChange={(e) => setCustomLearn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(customLearn, setCustomLearn, learns, setLearns); } }} />
            <button type="button" className="btn btn-secondary" onClick={() => addCustom(customLearn, setCustomLearn, learns, setLearns)}>Add</button>
          </div>
        </div>

        <label className="checkbox-line">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          I agree to the community guidelines and fair skill exchange.
        </label>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
