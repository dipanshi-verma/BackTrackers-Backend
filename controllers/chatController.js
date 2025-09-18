import ChatMessage from "../models/ChatMessage.js";

// Save Chat Message
export const saveMessage = async (req, res) => {
  try {
    const { sender, message } = req.body;

    const chatMsg = new ChatMessage({
      sender,
      message,
    });

    await chatMsg.save();
    res.status(201).json(chatMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Chat Messages
export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
