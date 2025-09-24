import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { text } = req.body;
    const msg = new Message({
      case: caseId,
      sender: req.user._id,
      text,
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const messages = await Message.find({ case: caseId }).populate("sender", "name role");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
