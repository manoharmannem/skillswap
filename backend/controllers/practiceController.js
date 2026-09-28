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

export const updatePractice = async (req, res) => {
  try {
    const incoming = Array.isArray(req.body.modules) ? req.body.modules : [];
    const allowedSkills = new Set((req.user.learningSkills || []).map((s) => String(s).trim().toLowerCase()));

    const modules = incoming
      .filter((module) => allowedSkills.has(String(module.skill || "").trim().toLowerCase()))
      .map((module) => ({
        id: module.id,
        skill: module.skill,
        level: module.level || "Beginner",
        description: module.description || "",
        topics: Array.isArray(module.topics)
          ? module.topics.map((topic) => ({
              id: topic.id,
              title: topic.title,
              description: topic.description || "",
              lesson: topic.lesson ? {
                intro: topic.lesson.intro || "",
                sections: Array.isArray(topic.lesson.sections)
                  ? topic.lesson.sections.map((section) => ({
                      heading: section.heading || "",
                      body: section.body || "",
                    }))
                  : [],
                example: topic.lesson.example || "",
              } : {
                intro: "",
                sections: [],
                example: "",
              },
              completed: Boolean(topic.completed),
            }))
          : [],
        completed: Array.isArray(module.topics) && module.topics.length > 0
          ? module.topics.every((topic) => Boolean(topic.completed))
          : Boolean(module.completed),
      }));

    req.user.practiceModules = modules;
    await req.user.save();
    res.json({ modules: req.user.practiceModules });
  } catch (error) {
    res.status(500).json({ message: "Failed to update practice modules", error: error.message });
  }
};
