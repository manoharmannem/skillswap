const TOPIC_LIBRARY = {
  javascript: ["Variables, types & functions","Arrays, objects & modern syntax","DOM and events","Async JavaScript & APIs","Build a small JavaScript project"],
  react: ["Components & JSX","Props and reusable components","State and event handling","Effects, forms & API calls","Build a complete React feature"],
  python: ["Syntax, variables & data types","Conditions, loops & functions","Collections & modules","Files, errors & packages","Build a Python project"],
  html: ["Document structure & semantic HTML","Forms, links & media","Accessibility basics","Responsive page structure","Build a complete webpage"],
  css: ["Selectors, box model & cascade","Flexbox layouts","CSS Grid layouts","Responsive design","Build a responsive interface"],
  sql: ["Tables, keys & basic queries","Filtering, sorting & grouping","Joins and relationships","Aggregations & window functions","Build practical SQL reports"],
  "data analysis": ["Data cleaning fundamentals","Exploring datasets","Descriptive statistics","Visualization & insights","Complete a data analysis workflow"],
  "public speaking": ["Structure a clear talk","Voice, pace & body language","Storytelling techniques","Handling questions & nerves","Deliver a short presentation"],
  "guitar chords": ["Basic posture & chord shapes","Common open chords","Chord transitions","Strumming patterns","Play a complete progression"],
  spanish: ["Greetings & introductions","Everyday vocabulary","Basic sentence patterns","Conversation practice","Real-world listening & speaking"],
  "watercolour basics": ["Materials & brush control","Colour mixing","Wet-on-wet technique","Light, shadow & composition","Paint a complete study"],
};

function keyFor(skill) {
  return String(skill || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function topicsFor(skill) {
  const key = keyFor(skill);
  const titles = TOPIC_LIBRARY[key] || [
    `Introduction to ${skill}`,
    `Core concepts of ${skill}`,
    `Guided practice in ${skill}`,
    `Intermediate techniques in ${skill}`,
    `Build a practical ${skill} project`,
  ];
  return titles.map((title, index) => ({
    id: `topic-${key.replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
    title: `Module ${index + 1}: ${title}`,
    description: `Learn and practise ${title.toLowerCase()}.`,
    completed: false,
  }));
}

export function createPracticeModules(learningSkills = []) {
  return [...new Set((Array.isArray(learningSkills) ? learningSkills : []).map((s) => String(s).trim()).filter(Boolean))]
    .map((skill, index) => ({
      id: `practice-${keyFor(skill).replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
      skill,
      level: "Beginner",
      description: `A guided learning path for ${skill}, broken into practical modules.`,
      completed: false,
      topics: topicsFor(skill),
    }));
}

export function practiceMatchesLearningSkills(modules = [], learningSkills = []) {
  const expected = new Set((learningSkills || []).map(keyFor).filter(Boolean));
  const actual = new Set((modules || []).map((m) => keyFor(m.skill)).filter(Boolean));
  return expected.size === actual.size && [...expected].every((skill) => actual.has(skill));
}
