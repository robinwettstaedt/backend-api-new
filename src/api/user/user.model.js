import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { notebookSchema } from '../notebook/notebook.model.js';

const userSchema = new mongoose.Schema({
  tokenVersion: {
    type: Number,
    required: true,
    default: 0,
  },
  username: {
    type: String,
  },
  firstName: {
    type: String,
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
    required: function () {
      return this.googleToken ? false : true;
    },
  },
  googleToken: {
    type: String,
  },
  picture: {
    type: String,
    required: true,
    // change to url of default picture
    default: 'defaultpicture.com',
  },
  settings: {
    theme: {
      type: String,
      enum: ['DARK', 'LIGHT'],
      default: 'DARK',
    },
    notifications: {
      type: String,
      enum: ['ALL', 'TODOS', 'NONE'],
      default: 'ALL',
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
