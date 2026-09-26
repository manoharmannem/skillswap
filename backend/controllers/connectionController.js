import Connection from "../models/connection.js";
import User from "../models/user.js";
import { notifyConnectionAccepted, notifyConnectionRequest } from "../services/emailService.js";

const fields = "name email skills learningSkills bio credits";

export const listConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ $or: [{ from: req.user._id }, { to: req.user._id }] }).sort({ updatedAt: -1 }).populate("from", fields).populate("to", fields);
    res.json({ connections });
  } catch (error) { res.status(500).json({ message: "Failed to fetch connections", error: error.message }); }
};

export const sendRequest = async (req, res) => {
  try {
    const { to } = req.body;
    if (!to || to === req.user._id.toString()) return res.status(400).json({ message: "Invalid connection target" });
    const target = await User.findById(to);
    if (!target) return res.status(404).json({ message: "User not found" });
    let connection = await Connection.findOne({ $or: [{ from: req.user._id, to }, { from: to, to: req.user._id }] });
    if (connection?.status === "accepted") return res.status(409).json({ message: "You're already connected" });
    if (connection) { connection.from = req.user._id; connection.to = to; connection.status = "pending"; await connection.save(); }
    else connection = await Connection.create({ from: req.user._id, to, status: "pending" });
    const emailResult = await notifyConnectionRequest({ recipient: target, sender: req.user });
    const populated = await Connection.findById(connection._id).populate("from", fields).populate("to", fields);
    res.status(201).json({ connection: populated, emailSent: Boolean(emailResult.sent), emailReason: emailResult.reason || null });
  } catch (error) { res.status(500).json({ message: "Failed to send request", error: error.message }); }
};

export const updateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await Connection.findById(req.params.id).populate("from", fields).populate("to", fields);
    if (!connection) return res.status(404).json({ message: "Connection not found" });
    if (!["accepted", "rejected", "cancelled"].includes(status)) return res.status(400).json({ message: "Invalid connection status" });
    if (status === "accepted" || status === "rejected") {
      if (connection.to._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Only the recipient can respond" });
    } else if (status === "cancelled") {
      if (connection.from._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Only the sender can cancel" });
      await connection.deleteOne();
      return res.json({ message: "Request cancelled" });
    }
    connection.status = status;
    await connection.save();
    let emailResult = null;
    if (status === "accepted") emailResult = await notifyConnectionAccepted({ recipient: connection.from, accepter: connection.to });
    const populated = await Connection.findById(connection._id).populate("from", fields).populate("to", fields);
    res.json({ connection: populated, emailSent: emailResult ? Boolean(emailResult.sent) : undefined, emailReason: emailResult?.reason || null });
  } catch (error) { res.status(500).json({ message: "Failed to update connection", error: error.message }); }
};
