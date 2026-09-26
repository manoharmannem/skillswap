import Meeting from "../models/meeting.js";
import User from "../models/user.js";
import Connection from "../models/connection.js";
import { notifyMeeting } from "../services/emailService.js";

const fields = "name email skills learningSkills";
async function ensureConnected(a, b) {
  return Connection.exists({ $or: [{ from: a, to: b }, { from: b, to: a }], status: "accepted" });
}

export const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ $or: [{ tutor: req.user._id }, { learner: req.user._id }] }).sort({ date: 1, time: 1 }).populate("tutor", fields).populate("learner", fields);
    res.json({ meetings });
  } catch (error) { res.status(500).json({ message: "Failed to fetch meetings", error: error.message }); }
};

export const createMeeting = async (req, res) => {
  try {
    const { title, withUserId, skill, date, time, duration = 60, meetingUrl = "" } = req.body;
    if (!title || !withUserId || !skill || !date || !time) return res.status(400).json({ message: "Please provide title, partner, skill, date and time" });
    if (!(await ensureConnected(req.user._id, withUserId))) return res.status(403).json({ message: "You can schedule meetings only with an accepted connection" });
    const partner = await User.findById(withUserId);
    if (!partner) return res.status(404).json({ message: "Meeting partner not found" });

    const currentTeaches = (req.user.skills || []).some((s) => s.toLowerCase() === String(skill).toLowerCase());
    const partnerTeaches = (partner.skills || []).some((s) => s.toLowerCase() === String(skill).toLowerCase());
    let tutor = partner._id; let learner = req.user._id;
    if (currentTeaches && !partnerTeaches) { tutor = req.user._id; learner = partner._id; }

    const meeting = await Meeting.create({ title: title.trim(), tutor, learner, skill, date, time, duration, meetingUrl });
    const populated = await Meeting.findById(meeting._id).populate("tutor", fields).populate("learner", fields);
    await notifyMeeting({ recipient: partner, organizer: req.user, meeting: populated });
    if (req.user.email && req.user.email !== partner.email) await notifyMeeting({ recipient: req.user, organizer: partner, meeting: populated });
    res.status(201).json({ meeting: populated, emailQueued: true });
  } catch (error) { res.status(500).json({ message: "Failed to create meeting", error: error.message }); }
};

export const updateMeeting = async (req, res) => {
  try {
    const allowed = {};
    for (const key of ["title", "skill", "date", "time", "duration", "meetingUrl", "status"]) if (req.body[key] !== undefined) allowed[key] = req.body[key];
    const meeting = await Meeting.findOneAndUpdate({ _id: req.params.id, $or: [{ tutor: req.user._id }, { learner: req.user._id }] }, allowed, { new: true, runValidators: true }).populate("tutor", fields).populate("learner", fields);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.json({ meeting });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate({ _id: req.params.id, $or: [{ tutor: req.user._id }, { learner: req.user._id }] }, { status: "cancelled" }, { new: true });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.json({ message: "Meeting cancelled", meeting });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
