import Flashcard from '../models/Flashcard.js';
import Document from '../models/Document.js';
import { generateFlashcards, isGeminiConfigured } from '../services/geminiService.js';

// Fallback generator used if Gemini hits rate limits or offline
const sampleFlashcards = (subject, count) => {
  const samples = [
    { question: 'What is the powerhouse of the cell?', answer: 'The mitochondria, producing ATP through cellular respiration.', difficulty: 'easy', subject },
    { question: "Explain Newton's First Law of Motion.", answer: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.', difficulty: 'medium', subject },
    { question: 'What is photosynthesis?', answer: 'The process by which plants convert light energy into chemical energy.', difficulty: 'easy', subject },
    { question: 'Define DNA replication.', answer: 'The biological process of producing two identical replicas of DNA from one original molecule.', difficulty: 'medium', subject },
    { question: 'What is the Pythagorean theorem?', answer: 'In a right triangle: a² + b² = c².', difficulty: 'easy', subject }
  ];
  return samples.slice(0, count);
};

export const generateFlashcardsController = async (req, res) => {
  try {
    const { content, subject = 'General', count = 10, documentId, overwrite = false } = req.body;
    let sourceContent = content || '';

    // 1. Look up document content if documentId is provided
    if (!sourceContent && documentId) {
      const doc = await Document.findOne({ _id: documentId, user: req.user._id });
      if (doc) {
        sourceContent = doc.content || doc.textContent || '';
      }
    }

    // 2. Fallback: If still no content provided, generate based on the Subject name itself
    if (!sourceContent || sourceContent.trim().length === 0) {
      sourceContent = `Key concepts, important definitions, and core study notes for the subject: ${subject}.`;
    }

    // Optional: Clear existing flashcards for this document if explicitly requested (regeneration)
    if (overwrite && documentId) {
      await Flashcard.deleteMany({ document: documentId, user: req.user._id });
    }

    let rawCards;
    if (isGeminiConfigured()) {
      try {
        rawCards = await generateFlashcards(sourceContent, subject, count);
      } catch (aiError) {
        console.warn('Gemini engine error, falling back to static samples:', aiError.message);
        rawCards = sampleFlashcards(subject, count);
      }
    } else {
      console.warn('Gemini not configured. Serving fallback cards.');
      rawCards = sampleFlashcards(subject, count);
    }

    // Save cards to MongoDB
    const cardsToInsert = rawCards.map((c) => ({
      user: req.user._id,
      question: c.question,
      answer: c.answer,
      difficulty: c.difficulty || 'medium',
      subject: subject !== 'All' ? subject : (c.subject || 'General'),
      document: documentId || null,
    }));

    const createdCards = await Flashcard.insertMany(cardsToInsert);

    const mappedFlashcards = createdCards.map((card) => ({
      id: card._id,
      _id: card._id,
      user: card.user,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty,
      subject: card.subject,
      document: card.document,
      bookmarked: card.bookmarked || false,
      learned: card.learned || false,
    }));

    return res.status(201).json({
      success: true,
      flashcards: mappedFlashcards
    });
  } catch (error) {
    console.error('Critical Flashcard Controller Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlashcards = async (req, res) => {
  try {
    const { subject, difficulty, search, bookmarked, documentId } = req.query;
    const query = { user: req.user._id };

    if (subject && subject !== 'All') query.subject = subject;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (documentId) query.document = documentId;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
      ];
    }
    if (bookmarked === 'true') query.bookmarked = true;

    const flashcards = await Flashcard.find(query).sort({ createdAt: -1 });

    const mapped = flashcards.map((card) => ({
      id: card._id,
      _id: card._id,
      user: card.user,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty,
      subject: card.subject,
      document: card.document,
      bookmarked: card.bookmarked,
      learned: card.learned,
    }));

    return res.json({
      success: true,
      flashcards: mapped
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFlashcard = async (req, res) => {
  try {
    const { bookmarked, learned, question, answer, difficulty, subject } = req.body;
    const card = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Flashcard not found' });

    if (bookmarked !== undefined) card.bookmarked = bookmarked;
    if (learned !== undefined) card.learned = learned;
    if (question) card.question = question;
    if (answer) card.answer = answer;
    if (difficulty) card.difficulty = difficulty;
    if (subject) card.subject = subject;

    const updated = await card.save();
    return res.json({
      success: true,
      flashcard: {
        id: updated._id,
        _id: updated._id,
        user: updated.user,
        question: updated.question,
        answer: updated.answer,
        difficulty: updated.difficulty,
        subject: updated.subject,
        bookmarked: updated.bookmarked,
        learned: updated.learned,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFlashcard = async (req, res) => {
  try {
    const card = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Flashcard not found' });

    await card.deleteOne();
    return res.json({ success: true, message: 'Flashcard successfully deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};