export const getPractice = async (req, res) => res.json({ modules: req.user.practiceModules || [] });
export const updatePractice = async (req, res) => {
  try {
    const modules = Array.isArray(req.body.modules) ? req.body.modules : [];
    req.user.practiceModules = modules;
    await req.user.save();
    res.json({ modules: req.user.practiceModules });
  } catch (error) { res.status(500).json({ message: "Failed to update practice modules", error: error.message }); }
};
