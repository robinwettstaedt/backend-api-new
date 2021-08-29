import mongoose from 'mongoose';

export const connect = (url = process.env.ATLAS_URI, opts = {}) => {
  return mongoose.connect(url, { ...opts, useNewUrlParser: true });
};
