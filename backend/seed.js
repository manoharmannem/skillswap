import bcrypt from "bcryptjs";
import Skill from "./models/skill.js";
import Quiz from "./models/quiz.js";
import User from "./models/user.js";
import Profile from "./models/profile.js";

const skills = [
  { name: "Design", category: "Design", description: "Visual design, UX research, prototyping, and design systems.", tutor: "" },
  { name: "Coding", category: "Programming", description: "Software engineering across frontend, backend, and data.", tutor: "" },
  { name: "Languages", category: "Languages", description: "Conversational practice and grammar fundamentals for world languages.", tutor: "" },
  { name: "Music", category: "Music", description: "Instrument technique, music theory, and songwriting.", tutor: "" },
  { name: "Business", category: "Business", description: "Strategy, marketing, and communication skills.", tutor: "" },
  { name: "Cooking", category: "Lifestyle", description: "Techniques, cuisines, and kitchen fundamentals.", tutor: "" },
  { name: "Photography", category: "Creative", description: "Composition, lighting, and editing for stills.", tutor: "" },
  { name: "Writing", category: "Creative", description: "Storytelling, editing, and clear written communication.", tutor: "" },
];

const quizzes = [
  { title: "React Fundamentals", skill: "Coding", questions: [
    { question: "What hook lets you add state to a function component?", options: ["useEffect", "useState", "useRef", "useMemo"], answerIndex: 1 },
    { question: "Which prop uniquely identifies items in a rendered list?", options: ["id", "index", "key", "ref"], answerIndex: 2 },
    { question: "What does JSX compile down to?", options: ["HTML strings", "React.createElement calls", "Web Components", "CSS-in-JS"], answerIndex: 1 },
  ]},
  { title: "Conversational Spanish", skill: "Languages", questions: [
    { question: "How do you say Good morning in Spanish?", options: ["Buenas noches", "Buenos días", "Buenas tardes", "Hasta luego"], answerIndex: 1 },
    { question: "What does ¿Cómo estás? mean?", options: ["What's your name?", "Where are you?", "How are you?", "How old are you?"], answerIndex: 2 },
    { question: "Gracias means:", options: ["Please", "Sorry", "Thank you", "Excuse me"], answerIndex: 2 },
  ]},
  { title: "Watercolour Basics", skill: "Design", questions: [
    { question: "Wet-on-wet refers to painting on paper that is:", options: ["Dry", "Already wet", "Frozen", "Covered in oil"], answerIndex: 1 },
    { question: "Mixing blue and yellow paint produces:", options: ["Purple", "Orange", "Green", "Brown"], answerIndex: 2 },
  ]},
];

const demoTutors = [];

const practiceModules = [
  { id: "p1", skill: "React Fundamentals", level: "Beginner", description: "Components, props, and state — the building blocks.", completed: true },
  { id: "p2", skill: "Conversational Spanish", level: "Beginner", description: "Everyday phrases for ordering, greeting, and small talk.", completed: false },
  { id: "p3", skill: "Watercolour Basics", level: "Beginner", description: "Wet-on-wet technique and basic colour mixing.", completed: false },
  { id: "p4", skill: "Public Speaking", level: "Intermediate", description: "Structuring a 5-minute talk and handling nerves.", completed: false },
  { id: "p5", skill: "Data Analysis with SQL", level: "Intermediate", description: "Joins, aggregations, and window functions.", completed: true },
  { id: "p6", skill: "Guitar Chords", level: "Beginner", description: "Open chords and simple strumming patterns.", completed: false },
];

export async function seedDatabase() {
  for (const skill of skills) await Skill.updateOne({ name: skill.name }, { $setOnInsert: skill }, { upsert: true });

  const modernQuizExists = await Quiz.exists({ title: { $exists: true }, questions: { $exists: true } });
  if (!modernQuizExists) {
    await Quiz.deleteMany({});
    await Quiz.insertMany(quizzes);
  } else {
    for (const quiz of quizzes) await Quiz.updateOne({ title: quiz.title }, { $setOnInsert: quiz }, { upsert: true });
  }

  const passwordHash = await bcrypt.hash("skillswap-demo", 12);
  for (const [name, email, userSkills, bio, credits] of demoTutors) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, passwordHash, skills: userSkills, bio, credits, practiceModules });
    } else {
      await User.updateOne({ _id: user._id }, { $set: { skills: user.skills?.length ? user.skills : userSkills, bio: user.bio || bio, credits: user.credits ?? credits, practiceModules: user.practiceModules?.length ? user.practiceModules : practiceModules } });
    }
    await Profile.updateOne({ user: user._id }, { $setOnInsert: { user: user._id, name: user.name, email: user.email, bio, skills: userSkills, learningSkills: [] } }, { upsert: true });
  }
}
