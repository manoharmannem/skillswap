import mongoose from "mongoose";
const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 },
  meetingUrl: { type: String, default: "" },
  status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
}, { timestamps: true });
export default mongoose.model("Meeting", meetingSchema);
