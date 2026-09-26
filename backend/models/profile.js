import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    learningSkills: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
