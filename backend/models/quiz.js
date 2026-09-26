import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: { type: [String], required: true, validate: { validator: (v) => v.length >= 2 && v.every((x) => String(x).trim()), message: "Each question needs at least two options" } },
  answerIndex: { type: Number, required: true, min: 0 },
}, { _id: true });

const attemptSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: { type: [Number], required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  skill: { type: String, required: true, trim: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: ["assigned", "completed", "cancelled"], default: "assigned" },
  questions: { type: [questionSchema], required: true, validate: { validator: (v) => v.length > 0, message: "Add at least one question" } },
  attempts: { type: [attemptSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
