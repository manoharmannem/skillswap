import Skill from "../models/skill.js";

export const getSkills = async (req, res) => {
  try { res.json({ skills: await Skill.find().sort({ name: 1 }) }); }
  catch (error) { res.status(500).json({ message: "Failed to fetch skills", error: error.message }); }
};

export const getSkillById = async (req, res) => {
  try { const skill = await Skill.findById(req.params.id); if (!skill) return res.status(404).json({ message: "Skill not found" }); res.json({ skill }); }
  catch (error) { res.status(500).json({ message: "Failed to fetch skill", error: error.message }); }
};

export const searchSkills = async (req, res) => {
  try { const q = req.query.q || ""; res.json({ skills: await Skill.find({ name: { $regex: q, $options: "i" } }) }); }
  catch (error) { res.status(500).json({ message: "Failed to search skills", error: error.message }); }
};

export const createSkill = async (req, res) => {
  try { const skill = await Skill.create(req.body); res.status(201).json({ skill }); }
  catch (error) { res.status(400).json({ message: error.message }); }
};
