import Profile from "../models/profile.js";
import User from "../models/user.js";

export const getProfiles = async (req, res) => {
  try { res.json({ profiles: await Profile.find().populate("user", "name email") }); }
  catch (error) { res.status(500).json({ message: "Failed to fetch profiles", error: error.message }); }
};

export const getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) profile = await Profile.create({ user: req.user._id, name: req.user.name, email: req.user.email, bio: req.user.bio, skills: req.user.skills, learningSkills: req.user.learningSkills });
    res.json({ profile });
  } catch (error) { res.status(500).json({ message: "Failed to fetch profile", error: error.message }); }
};

export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate("user", "name email");
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ profile });
  } catch (error) { res.status(500).json({ message: "Failed to fetch profile", error: error.message }); }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, bio = "", skills = [], learningSkills = [] } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name: name?.trim() || req.user.name, bio, skills, learningSkills }, { new: true, runValidators: true });
    const profile = await Profile.findOneAndUpdate({ user: user._id }, { name: user.name, email: user.email, bio, skills, learningSkills }, { new: true, upsert: true, runValidators: true });
    res.json({ message: "Profile updated successfully", profile, user: { id: user._id, name: user.name, fullName: user.name, email: user.email, skills: user.skills, learningSkills: user.learningSkills, bio: user.bio, credits: user.credits, practiceModules: user.practiceModules, quizScores: Object.fromEntries(user.quizScores || []) } });
  } catch (error) { res.status(500).json({ message: "Failed to update profile", error: error.message }); }
};
