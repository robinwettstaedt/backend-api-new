import mongoose from 'mongoose';

export const notebookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: '',
    },
    hasAccess: {
      type: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'user' }],
      required: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    notes: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'note' }],
    deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: mongoose.SchemaTypes.Date,
    visible: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const Notebook = mongoose.model('notebook', notebookSchema);
