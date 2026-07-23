import ChatHistory from '../models/ChatHistory.js';
import StudySession from '../models/StudySession.js';
import { chatWithTutor, isGeminiConfigured } from '../services/geminiService.js';

const fallbackReply = (message) => {
  return `I received your message: "${message}".

To enable full AI tutoring capabilities, please configure your Google Gemini API key in the server's \`.env\` file (GEMINI_API_KEY). Once configured, I'll be able to provide detailed, intelligent responses to your study questions.

In the meantime, here are some things I can help with once configured:
- Explaining complex concepts
- Generating practice questions
- Reviewing your study material
- Suggesting study strategies
- Helping with homework problems`;
};

export const chat = async (req, res) => {
  const { message, conversationId } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  let conversation;
  if (conversationId) {
    conversation = await ChatHistory.findOne({ _id: conversationId, user: req.user._id });
  }
  if (!conversation) {
    conversation = await ChatHistory.create({
      user: req.user._id,
      title: message.slice(0, 50),
      messages: [],
    });
  }

  let reply;
  if (isGeminiConfigured()) {
    try {
      reply = await chatWithTutor(message, conversation.messages);
    } catch (error) {
      reply = `I encountered an issue processing your request. ${error.message}. Please try again.`;
    }
  } else {
    reply = fallbackReply(message);
  }

  conversation.messages.push({ role: 'user', content: message });
  conversation.messages.push({ role: 'assistant', content: reply });
  await conversation.save();

  await StudySession.create({
    user: req.user._id,
    subject: 'AI Tutor',
    duration: 1,
    activity: 'chat',
  });

  res.json({ success: true, reply, conversationId: conversation._id });
};

export const getChatHistory = async (req, res) => {
  const conversations = await ChatHistory.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select('title messages.createdAt updatedAt');
  res.json({ success: true, conversations });
};

export const getConversation = async (req, res) => {
  const conversation = await ChatHistory.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  res.json({ success: true, conversation });
};

export const deleteConversation = async (req, res) => {
  const conversation = await ChatHistory.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  await conversation.deleteOne();
  res.json({ success: true, message: 'Conversation deleted' });
};
