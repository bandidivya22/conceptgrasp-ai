import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true },

    description: { type: String, default: '' },

    fileName: { type: String, required: true },

    filePath: { type: String, required: true },

    fileType: { type: String, required: true },

    fileSize: { type: Number, required: true },

    subject: { type: String, default: 'General' },

    tags: [{ type: String }],

    // ⭐ NEW FIELD
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

documentSchema.index({ user: 1, title: "text" });

export default mongoose.model("Document", documentSchema);