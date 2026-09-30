import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Profile from "../models/profile.js";
import { practiceMatchesLearningSkills } from "../utils/practiceModules.js";

const defaultPracticeModules = [
  { id: "p1", skill: "React Fundamentals", level: "Beginner", description: "Components, props, and state — the building blocks.", completed: true },
  { id: "p2", skill: "Conversational Spanish", level: "Beginner", description: "Everyday phrases for ordering, greeting, and small talk.", completed: false },
  { id: "p3", skill: "Watercolour Basics", level: "Beginner", description: "Wet-on-wet technique and basic colour mixing.", completed: false },
  { id: "p4", skill: "Public Speaking", level: "Intermediate", description: "Structuring a 5-minute talk and handling nerves.", completed: false },
  { id: "p5", skill: "Data Analysis with SQL", level: "Intermediate", description: "Joins, aggregations, and window functions.", completed: true },
  { id: "p6", skill: "Guitar Chords", level: "Beginner", description: "Open chords and simple strumming patterns.", completed: false },
];

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    fullName: user.name,
    email: user.email,
    skills: user.skills || [],
    learningSkills: user.learningSkills || [],
    bio: user.bio || "",
    credits: user.credits ?? 0,
    quizScores: Object.fromEntries(user.quizScores || []),
  };
}

function makeToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export const register = async (req, res) => {
  try {
    const { name, email, password, skills = [], learningSkills = [] } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Please provide name, email and password" });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "An account with that email already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, skills, learningSkills, credits: 4, practiceModules: createPracticeModules(learningSkills) });
    await Profile.create({ user: user._id, name: user.name, email: user.email, skills, learningSkills });

    const token = makeToken(user);
    return res.status(201).json({ message: "User registered successfully", token, user: safeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash +password");
    if (!user) return res.status(401).json({ message: "Incorrect email or password" });

    let valid = false;
    if (user.passwordHash) valid = await bcrypt.compare(password, user.passwordHash);
    else if (user.password) {
      valid = user.password === password;
      if (valid) {
        user.passwordHash = await bcrypt.hash(password, 12);
        user.password = undefined;
        await user.save();
      }
    }
    if (!valid) return res.status(401).json({ message: "Incorrect email or password" });

    const hydrated = await User.findById(user._id);
    if (hydrated.credits == null) {
      hydrated.credits = 4;
      await hydrated.save();
    }
    return res.json({ message: "Login successful", token: makeToken(hydrated), user: safeUser(hydrated) });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const me = async (req, res) => {
  res.json({ user: safeUser(req.user) });
};
