import { createPracticeModules, practiceMatchesLearningSkills } from "../utils/practiceModules.js";

export const getPractice = async (req, res) => {
  try {
    if (!practiceMatchesLearningSkills(req.user.practiceModules, req.user.learningSkills)) {
      req.user.practiceModules = createPracticeModules(req.user.learningSkills);
      await req.user.save();
    }
    res.json({ modules: req.user.practiceModules || [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to load practice modules", error: error.message });
  }
};

const cleanLesson = (lesson = {}) => ({
  intro: lesson.intro || "",
  sections: Array.isArray(lesson.sections)
    ? lesson.sections.map((section) => ({
        heading: section.heading || "",
        body: section.body || "",
      }))
    : [],
  example: lesson.example || "",
  sources: Array.isArray(lesson.sources)
    ? lesson.sources.map((source) => ({
        title: source.title || "",
        url: source.url || "",
      })).filter((source) => source.title && source.url)
    : [],
});

const cleanLessons = (lessons = []) => (Array.isArray(lessons) ? lessons : []).map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  description: lesson.description || "",
  lesson: cleanLesson(lesson.lesson),
  completed: Boolean(lesson.completed),
}));

const cleanModules = (modules = []) => (Array.isArray(modules) ? modules : []).map((module) => {
  const lessons = cleanLessons(module.lessons);
  return {
    id: module.id,
    key: module.key,
    title: module.title,
    description: module.description || "",
    lessons,
    completed: lessons.length > 0 ? lessons.every((lesson) => lesson.completed) : Boolean(module.completed),
  };
});

const cleanCategories = (categories = []) => (Array.isArray(categories) ? categories : []).map((category) => {
  const modules = cleanModules(category.modules);
  return {
    id: category.id,
    name: category.name,
    description: category.description || "",
    modules,
    completed: modules.length > 0 ? modules.every((module) => module.completed) : Boolean(category.completed),
  };
});

export const updatePractice = async (req, res) => {
  try {
    const incoming = Array.isArray(req.body.modules) ? req.body.modules : [];
    const allowedSkills = new Set((req.user.learningSkills || []).map((s) => String(s).trim().toLowerCase()));

    const modules = incoming
      .filter((module) => allowedSkills.has(String(module.skill || "").trim().toLowerCase()))
      .map((module) => {
        const categories = cleanCategories(module.categories);
        return {
          id: module.id,
          skill: module.skill,
          level: module.level || "Beginner",
          description: module.description || "",
          categories,
          completed: categories.length > 0 ? categories.every((category) => category.completed) : Boolean(module.completed),
        };
      });

    if (!modules.length && allowedSkills.size) {
      req.user.practiceModules = createPracticeModules(req.user.learningSkills);
    } else {
      req.user.practiceModules = modules;
    }

    await req.user.save();
    res.json({ modules: req.user.practiceModules });
  } catch (error) {
    res.status(500).json({ message: "Failed to update practice modules", error: error.message });
  }
};

export { practiceMatchesLearningSkills };
