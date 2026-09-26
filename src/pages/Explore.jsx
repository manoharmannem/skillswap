import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles, Users, GraduationCap, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { skillDescriptions } from "../data/skillsData.js";
import { uniqueSkillsFromUsers, descriptionForSkill } from "../utils/skillDirectory.js";

function initialsOf(name) {
  return (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function MemberCard({ member, matchLabel }) {
  const { sendRequest, getStatusWith } = useConnections();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const status = getStatusWith(member.email).status;

  async function connect() {
    setBusy(true);
    const result = await sendRequest(member.email);
    setBusy(false);
    setMessage(result.error || "Request sent");
  }

  return (
    <article className="panel" style={{ padding: "1.15rem" }}>
      <div style={{ display: "flex", gap: ".8rem", alignItems: "center" }}>
        <span className="avatar-fill ember-fill">{initialsOf(member.fullName)}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600 }}>{member.fullName}</p>
          <p style={{ fontSize: ".75rem", color: "var(--muted-foreground)" }}>{matchLabel}</p>
        </div>
      </div>
      <p style={{ marginTop: ".8rem", fontSize: ".84rem", color: "var(--muted-foreground)" }}>
        {member.bio || "SkillSwap member"}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginTop: ".75rem" }}>
        {(member.skills || []).map((skill) => <span key={skill} className="chip-static">{skill}</span>)}
      </div>
      <div style={{ display: "flex", gap: ".5rem", marginTop: "1rem", alignItems: "center" }}>
        <Link to={`/dashboard/tutors/${encodeURIComponent(member.email)}`} className="btn btn-secondary btn-sm">View profile</Link>
        {status === "none" && <button className="btn btn-primary btn-sm" disabled={busy} onClick={connect}>{busy ? "Sending…" : "Connect"}</button>}
        {status === "pending_sent" && <span className="badge badge-upcoming">Request sent</span>}
        {status === "accepted" && <span className="badge badge-completed">Connected</span>}
        {message && <span style={{ fontSize: ".7rem", color: "var(--muted-foreground)" }}>{message}</span>}
      </div>
    </article>
  );
}

export default function Explore() {
  const { user, listUsers } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const allUsers = listUsers().filter((u) => u.email !== user?.email);
  const availableSkills = useMemo(() => uniqueSkillsFromUsers(allUsers), [allUsers]);

  const matches = useMemo(() => ({
    learn: allUsers.filter((u) => (u.skills || []).some((skill) => (user?.learningSkills || []).some((wanted) => wanted.toLowerCase() === skill.toLowerCase()))),
    teach: allUsers.filter((u) => (u.learningSkills || []).some((wanted) => (user?.skills || []).some((skill) => wanted.toLowerCase() === skill.toLowerCase()))),
  }), [allUsers, user]);

  const tutorsBySkill = useMemo(() => {
    const map = {};
    availableSkills.forEach((skill) => { map[skill] = allUsers.filter((u) => (u.skills || []).some((s) => s.toLowerCase() === skill.toLowerCase())); });
    return map;
  }, [allUsers, availableSkills]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const skillMatches = availableSkills.filter((skill) => skill.toLowerCase().includes(q) || descriptionForSkill(skill, skillDescriptions).toLowerCase().includes(q));
    const userMatches = allUsers.filter((u) => u.fullName.toLowerCase().includes(q) || [...(u.skills || []), ...(u.learningSkills || [])].some((s) => s.toLowerCase().includes(q)));
    return {
      skillMatches,
      userMatches,
      tutorMatches: userMatches.filter((u) => (u.skills || []).length > 0),
    };
  }, [query, allUsers, availableSkills]);

  const hasResults = results && (results.skillMatches.length || results.userMatches.length);

  return (
    <div>
      <p className="page-eyebrow">Community</p>
      <h1 className="page-title">Find people to exchange skills with</h1>
      <p className="page-sub">These members come directly from registered SkillSwap accounts. No hard-coded tutor directory.</p>

      <div className="explore-search panel">
        <Search size={18} color="var(--muted-foreground)" />
        <input className="explore-search-input" placeholder="Search skills, people, or learning goals…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search SkillSwap" />
      </div>

      {results && (
        <div className="panel search-results" style={{ marginTop: ".75rem" }}>
          {!hasResults ? <p className="empty-note">No registered members or skills match "{query}".</p> : (
            <>
              {results.skillMatches.map((skill) => (
                <button key={skill} className="result-row" onClick={() => navigate(`/dashboard/skills/${encodeURIComponent(skill)}`)}>
                  <span className="result-icon skill-icon"><Sparkles size={16} /></span>
                  <span><span className="result-title">{skill}</span><span className="result-sub">{tutorsBySkill[skill]?.length || 0} members can teach this</span></span>
                  <span className="badge badge-upcoming">Skill</span>
                </button>
              ))}
              {results.userMatches.map((u) => (
                <button key={u.email} className="result-row" onClick={() => navigate(`/dashboard/tutors/${encodeURIComponent(u.email)}`)}>
                  <span className="avatar-fill ember-fill result-icon">{initialsOf(u.fullName)}</span>
                  <span><span className="result-title">{u.fullName}</span><span className="result-sub">Teaches: {(u.skills || []).join(", ") || "—"} · Learns: {(u.learningSkills || []).join(", ") || "—"}</span></span>
                  <span className="badge badge-completed">Member</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {user?.learningSkills?.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: "2.5rem" }}>
            <div><p className="section-title">People who can teach you</p><p className="page-sub" style={{ marginTop: ".35rem" }}>Matches based on the skills you want to learn.</p></div>
          </div>
          <div className="grid-3" style={{ marginTop: "1rem" }}>
            {matches.learn.length ? matches.learn.map((m) => <MemberCard key={m.email} member={m} matchLabel="Teaches something you want to learn" />) : <p className="empty-note">No matching teachers yet. As new members register, they will appear here.</p>}
          </div>
        </>
      )}

      {user?.skills?.length > 0 && (
        <>
          <div style={{ marginTop: "2.5rem" }}><p className="section-title">People who want what you teach</p><p className="page-sub" style={{ marginTop: ".35rem" }}>Potential exchange partners based on your teaching skills.</p></div>
          <div className="grid-3" style={{ marginTop: "1rem" }}>
            {matches.teach.length ? matches.teach.map((m) => <MemberCard key={m.email} member={m} matchLabel="Wants to learn one of your skills" />) : <p className="empty-note">No matching learners yet. Your future matches will appear here.</p>}
          </div>
        </>
      )}

      <div style={{ marginTop: "2.5rem" }}>
        <p className="section-title">Skills available in the community</p>
        <div className="skill-card-grid" style={{ marginTop: "1rem" }}>
          {availableSkills.length ? availableSkills.map((skill) => {
            const tutors = tutorsBySkill[skill] || [];
            const featured = tutors[0];
            return (
              <article key={skill} className="panel skill-card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".75rem" }}>
                  <div><span className="chip-static">{skill}</span><h3 style={{ marginTop: ".75rem", fontSize: "1.05rem", fontWeight: 600 }}>{skill} Skill Exchange</h3></div>
                  <span className="skill-card-icon"><GraduationCap size={20} /></span>
                </div>
                <p className="skill-card-desc">{descriptionForSkill(skill, skillDescriptions)}</p>
                <div className="skill-card-footer">
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    {featured ? <><span className="avatar-fill ember-fill" style={{ width: "1.85rem", height: "1.85rem", fontSize: ".68rem" }}>{initialsOf(featured.fullName)}</span><span style={{ fontSize: ".78rem", color: "var(--muted-foreground)" }}>{featured.fullName}{tutors.length > 1 ? ` +${tutors.length - 1} more` : ""}</span></> : <span style={{ fontSize: ".78rem", color: "var(--faint-foreground)" }}><Users size={14} style={{ verticalAlign: "-2px", marginRight: ".3rem" }} />No teachers yet</span>}
                  </div>
                  <Link to={`/dashboard/skills/${encodeURIComponent(skill)}`} className="btn btn-secondary btn-sm">View Details <ArrowRight size={14}/></Link>
                </div>
              </article>
            );
          }) : <p className="empty-note">No skills have been registered by community members yet.</p>}
        </div>
      </div>
    </div>
  );
}
