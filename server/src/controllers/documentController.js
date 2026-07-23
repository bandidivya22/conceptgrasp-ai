import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const extractTextFromFile = async (file) => {
  try {
    const ext = path.extname(file.path).toLowerCase();

    if (ext === ".txt") {
      return fs.readFileSync(file.path, "utf8");
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({
        path: file.path,
      });

      return result.value;
    }

    if (ext === ".pdf") {
      const data = new Uint8Array(fs.readFileSync(file.path));

      const pdf = await pdfjs.getDocument({
        data,
      }).promise;

      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        text +=
          content.items
            .map((item) => item.str)
            .join(" ") + "\n";
      }

      return text;
    }

    return "";
  } catch (err) {
    console.log(err);
    return "";
  }
};

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const { title, description, subject, tags } = req.body;
  const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [];

const extractedContent = await extractTextFromFile(req.file);

const doc = await Document.create({
    user: req.user._id,
    title: title || req.file.originalname,
    description: description || '',
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    subject: subject || 'General',
    tags: tagsArray,
    content: extractedContent,
});

  res.status(201).json({ success: true, document: doc });
};

export const getDocuments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const subject = req.query.subject || '';

  const query = { user: req.user._id };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (subject && subject !== 'All') {
    query.subject = subject;
  }

  const total = await Document.countDocuments(query);
  const documents = await Document.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getDocument = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  res.json({ success: true, document: doc });
};

export const updateDocument = async (req, res) => {
  const { title, description, subject, tags } = req.body;
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }

  if (title) doc.title = title;
  if (description !== undefined) doc.description = description;
  if (subject) doc.subject = subject;
  if (tags) {
    doc.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
  }

  const updated = await doc.save();
  res.json({ success: true, document: updated });
};

export const deleteDocument = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }

  const fullPath = path.join(__dirname, '../../', doc.filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  await doc.deleteOne();
  res.json({ success: true, message: 'Document deleted' });
};

export const getDocumentContent = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }

  const fullPath = path.join(__dirname, '../../', doc.filePath);
  const fileObj = {
    path: fullPath,
    originalname: doc.fileName,
    mimetype: doc.fileType,
  };
  const content = await extractTextFromFile(fileObj);
  res.json({ success: true, content, document: doc });
};
import { summarizeDocument } from '../services/geminiService.js';

export const handleSummarize = async (req, res) => {
  try {
    const { text, length } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Document text is required' });
    }
    const summary = await summarizeDocument(text, length);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};