import mongoose from 'mongoose';

export const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'Note',
    },
    content: {
      type: {},
      required: true,
      default: {},
    },
    notebook: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'notebook',
      required: true,
    },
    emoji: {
      type: {},
      required: true,
      default: {},
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
    lastUpdatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    locked: { type: Boolean, required: true, default: false },
    favourited: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

noteSchema.index({}, {});

export const Note = mongoose.model('note', noteSchema);
