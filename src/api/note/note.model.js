import mongoose from 'mongoose';

export const noteSchema = new mongoose.Schema(
  {
    content: {
      type: {},
      required: true,
      default: {},
    },
    //   title: {
    //     type: String,
    //     default: 'Note',
    //   },
    //   color: {
    //     type: String,
    //     default: '',
    //   },
    //   accessibleBy: {
    //     type: [
    //       {
    //         type: mongoose.SchemaTypes.ObjectId,
    //         ref: 'user',
    //         writeAccess: {
    //           type: Boolean,
    //           default: false,
    //         },
    //       },
    //     ],
    //     required: true,
    //   },
    //   createdBy: {
    //     type: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
    //     required: true,
    //   },
    //   content: {},
    //   active: {
    //     type: Boolean,
    //     default: true,
    //   },
    //   deleted: {
    //     type: Date,
    //   },
    //   notebook: {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: 'notebook',
    //     required: true,
    //   },
  },
  { timestamps: true }
);

noteSchema.index({}, {});

export const Note = mongoose.model('note', noteSchema);
