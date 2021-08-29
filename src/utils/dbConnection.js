import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connect = (url = process.env.ATLAS_URI, opts = {}) => {
  return mongoose.connect(url, {
    ...opts,
    maxPoolSize: 50,
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
  });
};
