import Quiz from "../models/quiz.js";
import User from "../models/user.js";
import Connection from "../models/connection.js";
import { notifyQuizAssigned, notifyQuizCompleted } from "../services/emailService.js";

const userFields = "name email skills learningSkills";
const canSeeQuiz = (quiz, userId) => quiz.creator._id.toString() === userId.toString() || quiz.assignedTo._id.toString() === userId.toString();

function publicQuiz(quiz, userId) {
  const isCreator = quiz.creator._id.toString() === userId.toString();
  const isParticipant = quiz.assignedTo._id.toString() === userId.toString();
  if (!isCreator && !isParticipant) return null;
  const base = {
    _id: quiz._id, title: quiz.title, skill: quiz.skill, status: quiz.status,
    creator: { _id: quiz.creator._id, name: quiz.creator.name, email: quiz.creator.email },
    assignedTo: { _id: quiz.assignedTo._id, name: quiz.assignedTo.name, email: quiz.assignedTo.email },
    createdAt: quiz.createdAt, updatedAt: quiz.updatedAt,
    questions: quiz.questions.map((q) => ({ _id: q._id, question: q.question, options: q.options, ...(isCreator ? { answerIndex: q.answerIndex } : {}) })),
  };
  if (isCreator) base.attempts = quiz.attempts.map((a) => ({ _id: a._id, participant: a.participant, answers: a.answers, score: a.score, total: a.total, submittedAt: a.submittedAt }));
  return base;
}

async function isConnected(a, b) {
  return Connection.exists({ $or: [{ from: a, to: b }, { from: b, to: a }], status: "accepted" });
}

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ $or: [{ creator: req.user._id }, { assignedTo: req.user._id }] }).sort({ updatedAt: -1 }).populate("creator", userFields).populate("assignedTo", userFields);
    res.json({ quizzes: quizzes.map((q) => publicQuiz(q, req.user._id)).filter(Boolean) });
  } catch (error) { res.status(500).json({ message: "Failed to fetch quizzes", error: error.message }); }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("creator", userFields).populate("assignedTo", userFields);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    const result = publicQuiz(quiz, req.user._id);
    if (!result) return res.status(403).json({ message: "You do not have access to this quiz" });
    res.json({ quiz: result });
  } catch (error) { res.status(500).json({ message: "Failed to fetch quiz", error: error.message }); }
};

export const createQuiz = async (req, res) => {
  try {
    const { title, skill, assignedTo, questions } = req.body;
    if (!title?.trim() || !skill?.trim() || !assignedTo || !Array.isArray(questions) || !questions.length) return res.status(400).json({ message: "Title, skill, participant and at least one question are required" });
    if (assignedTo === req.user._id.toString()) return res.status(400).json({ message: "Choose another connected user" });
    if (!(await isConnected(req.user._id, assignedTo))) return res.status(403).json({ message: "You can assign quizzes only to accepted connections" });
    const participant = await User.findById(assignedTo);
    if (!participant) return res.status(404).json({ message: "Participant not found" });
    const cleanQuestions = questions.map((q) => ({ question: String(q.question || "").trim(), options: (q.options || []).map((x) => String(x || "").trim()), answerIndex: Number(q.answerIndex) }));
    for (const q of cleanQuestions) if (!q.question || q.options.length < 2 || q.options.some((x) => !x) || q.answerIndex < 0 || q.answerIndex >= q.options.length) return res.status(400).json({ message: "Every question needs text, at least two options, and a valid correct answer" });
    const quiz = await Quiz.create({ title: title.trim(), skill: skill.trim(), creator: req.user._id, assignedTo, questions: cleanQuestions });
    const populated = await Quiz.findById(quiz._id).populate("creator", userFields).populate("assignedTo", userFields);
    await notifyQuizAssigned({ recipient: participant, creator: req.user, quiz: populated });
    res.status(201).json({ quiz: publicQuiz(populated, req.user._id), emailQueued: true });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, creator: req.user._id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found or you are not the creator" });
    const { title, skill, assignedTo, questions } = req.body;
    const originalAssignedTo = quiz.assignedTo.toString();
    if (title !== undefined) quiz.title = String(title).trim();
    if (skill !== undefined) quiz.skill = String(skill).trim();
    if (assignedTo && assignedTo !== quiz.assignedTo.toString()) {
      if (!(await isConnected(req.user._id, assignedTo))) return res.status(403).json({ message: "You can assign quizzes only to accepted connections" });
      quiz.assignedTo = assignedTo;
    }
    if (questions) {
      const clean = questions.map((q) => ({ question: String(q.question || "").trim(), options: (q.options || []).map((x) => String(x || "").trim()), answerIndex: Number(q.answerIndex) }));
      for (const q of clean) if (!q.question || q.options.length < 2 || q.options.some((x) => !x) || q.answerIndex < 0 || q.answerIndex >= q.options.length) return res.status(400).json({ message: "Every question needs text, at least two options, and a valid correct answer" });
      quiz.questions = clean;
      quiz.attempts = [];
      quiz.status = "assigned";
    }
    await quiz.save();
    const populated = await Quiz.findById(quiz._id).populate("creator", userFields).populate("assignedTo", userFields);
    if (assignedTo && assignedTo.toString() !== originalAssignedTo) {
      await notifyQuizAssigned({ recipient: populated.assignedTo, creator: req.user, quiz: populated });
    }
    res.json({ quiz: publicQuiz(populated, req.user._id) });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found or you are not the creator" });
    res.json({ message: "Quiz deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, assignedTo: req.user._id }).populate("creator", userFields);
    if (!quiz) return res.status(404).json({ message: "Assigned quiz not found" });
    if (quiz.attempts.some((a) => a.participant.toString() === req.user._id.toString())) return res.status(409).json({ message: "You have already completed this quiz" });
    const answers = Array.isArray(req.body.answers) ? req.body.answers.map((x) => Number(x)) : [];
    if (answers.length !== quiz.questions.length || answers.some((x, i) => !Number.isInteger(x) || x < 0 || x >= quiz.questions[i].options.length)) return res.status(400).json({ message: "Please answer every question before submitting" });
    const score = quiz.questions.reduce((sum, q, i) => sum + (answers[i] === q.answerIndex ? 1 : 0), 0);
    const total = quiz.questions.length;
    quiz.attempts.push({ participant: req.user._id, answers, score, total });
    quiz.status = "completed";
    const previous = req.user.quizScores?.get(req.params.id);
    const previousScore = previous?.score || 0;
    const creditGain = Math.max(0, score - previousScore);
    req.user.quizScores.set(req.params.id, { score, total, date: new Date() });
    req.user.credits = (req.user.credits || 0) + creditGain;
    await quiz.save();
    await req.user.save();
    await notifyQuizCompleted({ recipient: quiz.creator, participant: req.user, quiz, score, total });
    res.json({ message: "Quiz submitted", score, total, credits: req.user.credits, creditGain });
  } catch (error) { res.status(500).json({ message: "Failed to submit quiz", error: error.message }); }
};
