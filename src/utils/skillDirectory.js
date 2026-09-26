export function normalizeSkill(value) {
  return String(value || "").trim();
}

export function uniqueSkillsFromUsers(users = []) {
  const set = new Set();
  users.forEach((u) => {
    [...(u.skills || []), ...(u.learningSkills || [])].forEach((skill) => {
      const normalized = normalizeSkill(skill);
      if (normalized) set.add(normalized);
    });
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function skillsForUser(users = [], user) {
  return uniqueSkillsFromUsers([
    ...(users || []),
    ...(user ? [user] : []),
  ]);
}

export function descriptionForSkill(skill, descriptions = {}) {
  return descriptions[skill] || `${skill} skill exchange — find members who can teach it or want to learn it.`;
}
