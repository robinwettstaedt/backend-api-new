import mongoose from 'mongoose';

export const notebookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '',
  },
  accessibleBy: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'user' }],
    required: true,
  },
  createdBy: {
    type: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
    required: true,
  },
  notes: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'note' }],
  },
});

notebookSchema.index({}, {});

export const Notebook = mongoose.model('notebook', notebookSchema);
