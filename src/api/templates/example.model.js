import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    // status: {
    //   type: String,
    //   required: true,
    //   enum: ['active', 'complete', 'pastdue'],
    //   default: 'active',
    // },
    // notes: String,
    // due: Date,
    // createdBy: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: 'user',
    //   required: true
    // },
    // list: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: 'list',
    //   required: true
    // }
  },
  { timestamps: true }
);

// exampleSchema.index({ list: 1, name: 1 }, { unique: true });

export const Example = mongoose.model('example', exampleSchema);
