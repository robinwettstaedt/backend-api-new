import mongoose from 'mongoose';
import { notebookSchema } from '../notebook/notebook.model';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: 'defaultpicture.com',
  },
  settings: {
    theme: {
      type: String,
      enum: ['DARK', 'LIGHT'],
      default: 'DARK',
    },
    notifications: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  notebooks: {
    type: [notebookSchema],
    order,
  },
});

userSchema.index({}, {});

export const User = mongoose.model('user', userSchema);
