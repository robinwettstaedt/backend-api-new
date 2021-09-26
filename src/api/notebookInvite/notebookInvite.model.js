import mongoose from 'mongoose';

export const notebookInviteSchema = new mongoose.Schema(
  {
    notebook: {
      type: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'notebook' }],
      required: true,
    },
    inviter: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    receiver: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
);

notebookInviteSchema.index({}, {});

export const NotebookInvite = mongoose.model(
  'notebookInvite',
  notebookInviteSchema
);
