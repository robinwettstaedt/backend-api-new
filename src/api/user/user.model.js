import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { notebookSchema } from '../notebook/notebook.model.js';

const userSchema = new mongoose.Schema({
  //   username: {
  //     type: String,
  //     unique: true,
  //     lowercase: true,
  //     required: true,
  //   },
  tokenVersion: {
    type: Number,
    required: true,
    default: 0,
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
  },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(this.password, 8, (err, hash) => {
    if (err) {
      return next(err);
    }

    this.password = hash;
    next();
  });
});

userSchema.methods.checkPassword = function (password) {
  const passwordHash = this.password;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        return reject(err);
      }

      resolve(same);
    });
  });
};

userSchema.index({}, {});

export const User = mongoose.model('user', userSchema);
