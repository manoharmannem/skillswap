import Message from "../models/message.js";
import Connection from "../models/connection.js";

async function canMessage(senderId, receiverId) {
  const connection = await Connection.findOne({
    $or: [
      { from: senderId, to: receiverId, status: "accepted" },
      { from: receiverId, to: senderId, status: "accepted" },
    ],
  }).select("_id").lean();

  return Boolean(connection);
}

export const sendMessage = async (req, res) => {
  try {
    const receiver = req.body.receiver;
    const message = String(req.body.message || "").trim();

    if (!receiver || !message) {
      return res.status(400).json({ message: "Please provide receiver and message" });
    }

    if (String(receiver) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    if (!(await canMessage(req.user._id, receiver))) {
      return res.status(403).json({ message: "Messaging is available only after the connection is accepted" });
    }

    const created = await Message.create({
      sender: req.user._id,
      receiver,
      message: message.slice(0, 2000),
    });

    const data = await Message.findById(created._id)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .lean();

    res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;

    if (!(await canMessage(req.user._id, otherUserId))) {
      return res.status(403).json({ message: "Messaging is available only after the connection is accepted" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .lean();

    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversation", error: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Return one row per conversation instead of loading every historical message.
    // This keeps the inbox fast even after the account has many messages.
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { name: 1, email: 1 } }],
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          user: 1,
          unreadCount: 1,
          lastMessage: {
            _id: "$lastMessage._id",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
            message: "$lastMessage.message",
            createdAt: "$lastMessage.createdAt",
            isRead: "$lastMessage.isRead",
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
