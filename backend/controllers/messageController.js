import Message from "../models/message.js";

export const sendMessage = async (req, res) => {
  try {
    const receiver = req.body.receiver;
    const message = String(req.body.message || "").trim();
    if (!receiver || !message) return res.status(400).json({ message: "Please provide receiver and message" });
    const created = await Message.create({ sender: req.user._id, receiver, message });
    const data = await Message.findById(created._id).populate("sender", "name email").populate("receiver", "name email");
    res.status(201).json({ data });
  } catch (error) { res.status(500).json({ message: "Failed to send message", error: error.message }); }
};

export const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const messages = await Message.find({ $or: [{ sender: req.user._id, receiver: otherUserId }, { sender: otherUserId, receiver: req.user._id }] }).sort({ createdAt: 1 }).populate("sender", "name email").populate("receiver", "name email");
    await Message.updateMany({ sender: otherUserId, receiver: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ messages });
  } catch (error) { res.status(500).json({ message: "Failed to fetch conversation", error: error.message }); }
};

export const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] }).sort({ createdAt: -1 }).populate("sender", "name email").populate("receiver", "name email");
    const seen = new Map();
    for (const m of messages) {
      const other = m.sender._id.toString() === req.user._id.toString() ? m.receiver : m.sender;
      const key = other._id.toString();
      if (!seen.has(key)) seen.set(key, { user: other, lastMessage: m, unreadCount: 0 });
      if (m.receiver._id.toString() === req.user._id.toString() && !m.isRead) seen.get(key).unreadCount += 1;
    }
    res.json({ conversations: [...seen.values()] });
  } catch (error) { res.status(500).json({ message: "Failed to fetch conversations", error: error.message }); }
};

export const markMessageAsRead = async (req, res) => {
  try { const message = await Message.findOneAndUpdate({ _id: req.params.id, receiver: req.user._id }, { isRead: true }, { new: true }); if (!message) return res.status(404).json({ message: "Message not found" }); res.json({ data: message }); }
  catch (error) { res.status(500).json({ message: error.message }); }
};
