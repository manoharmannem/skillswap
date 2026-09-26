import mongoose from "mongoose";

const practiceModuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    skill: { type: String, required: true },
    level: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const quizScoreSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: false, select: false },
    password: { type: String, select: false },
    skills: { type: [String], default: [] },
    learningSkills: { type: [String], default: [] },
    bio: { type: String, default: "" },
    credits: { type: Number, default: 4 },
    practiceModules: { type: [practiceModuleSchema], default: [] },
    quizScores: { type: Map, of: quizScoreSchema, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
