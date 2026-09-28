import { buildLessonTopics } from "./practiceLessons.js";

const CATEGORY_LIBRARY = {
  coding: ["C", "C++", "Java", "Python", "JavaScript"],
  programming: ["C", "C++", "Java", "Python", "JavaScript"],
  "web development": ["HTML", "CSS", "JavaScript", "React"],
  "data analysis": ["Python", "SQL", "Excel"],
  design: ["UI/UX", "Figma", "Visual Design"],
  "public speaking": ["Public Speaking", "Presentation Skills", "Storytelling"],
  guitar: ["Guitar", "Guitar Chords"],
  spanish: ["Beginner Spanish", "Conversation", "Grammar", "Listening"],
  "watercolour": ["Watercolour Basics", "Colour & Mixing", "Techniques", "Composition"]
};

const MODULES = [
  ["foundations", "Module 1 — Foundations", "Build the essential concepts from the ground up."],
  ["core", "Module 2 — Core Skills", "Practise the main techniques with guided lessons."],
  ["structures", "Module 3 — Working with Real Problems", "Connect concepts and solve practical tasks."],
  ["projects", "Module 4 — Practical Projects", "Apply what you learned in complete small projects."],
  ["advanced", "Module 5 — Next Level", "Strengthen your skills and prepare for independent work."]
];

const keyFor = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

function categoriesFor(skill) {
  const key = keyFor(skill);
  return CATEGORY_LIBRARY[key] || [String(skill || "").trim() || "General"];
}

function buildCategory(skill, category, categoryIndex) {
  const categoryKey = keyFor(category);
  return {
    id: `category-${categoryKey.replace(/[^a-z0-9]+/g, "-")}-${categoryIndex + 1}`,
    name: category,
    description: `Learn ${category} through five structured modules and complete lessons.`,
    completed: false,
    modules: MODULES.map(([id, title, description], index) => ({
      id: `${categoryKey.replace(/[^a-z0-9]+/g, "-")}-module-${index + 1}`,
      key: id,
      title,
      description,
      completed: false,
      lessons: buildLessonTopics(skill, category, id, title)
    }))
  };
}

export function createPracticeModules(learningSkills = []) {
  return [...new Set(
    (Array.isArray(learningSkills) ? learningSkills : [])
      .map((s) => String(s).trim())
      .filter(Boolean)
  )].map((skill, index) => ({
    id: `practice-${keyFor(skill).replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
    skill,
    level: "Beginner",
    description: `A structured ${skill} learning path: choose a category, complete five modules, then study each lesson from start to finish.`,
    completed: false,
    categories: categoriesFor(skill).map((category, categoryIndex) => buildCategory(skill, category, categoryIndex))
  }));
}

export function practiceMatchesLearningSkills(modules = [], learningSkills = []) {
  const expected = new Set((learningSkills || []).map(keyFor).filter(Boolean));
  const actual = new Set((modules || []).map((m) => keyFor(m.skill)).filter(Boolean));
  if (expected.size !== actual.size || ![...expected].every((skill) => actual.has(skill))) return false;

  return (modules || []).every((skill) =>
    Array.isArray(skill.categories) &&
    skill.categories.length > 0 &&
    skill.categories.every((category) =>
      Array.isArray(category.modules) &&
      category.modules.length === 5 &&
      category.modules.every((module) =>
        Array.isArray(module.lessons) &&
        module.lessons.length > 0 &&
        module.lessons.every((lesson) =>
          lesson.lesson &&
          Array.isArray(lesson.lesson.sections) &&
          lesson.lesson.sections.length >= 9 &&
          Array.isArray(lesson.lesson.sources)
        )
      )
    )
  );
}

export { keyFor };
