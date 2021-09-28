import mongoose from 'mongoose';

export const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'Note',
    },
    emoji: {
      type: {},
      required: true,
      default: {},
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    done: {
      type: Boolean,
      required: true,
      default: false,
    },
    dueDate: {
      type: mongoose.SchemaTypes.Date,
      required: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'],
    },
    notification: {
      type: Boolean,
      required: true,
      default: false,
    },
    repeating: {
      type: String,
      enum: ['MAYBE', 'NOT', 'NEEDED'],
    },
    deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: {
      type: mongoose.SchemaTypes.Date,
      required: function () {
        return this.deleted;
      },
    },
  },
  { timestamps: true }
);

todoSchema.index({ createdBy: 1 });

export const Todo = mongoose.model('todo', todoSchema);
