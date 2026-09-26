import User from "../models/user.js";

function safe(user) {
  return { id: user._id, name: user.name, fullName: user.name, email: user.email, skills: user.skills || [], learningSkills: user.learningSkills || [], bio: user.bio || "", credits: user.credits ?? 0, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(safe) });
  } catch (error) { res.status(500).json({ message: "Failed to fetch users", error: error.message }); }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: safe(user) });
  } catch (error) { res.status(500).json({ message: "Failed to fetch user", error: error.message }); }
};
