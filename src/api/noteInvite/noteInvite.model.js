import mongoose from 'mongoose';

export const noteInviteSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'note',
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

noteInviteSchema.index({ note: 1 });

export const NoteInvite = mongoose.model('noteInvite', noteInviteSchema);
