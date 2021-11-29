import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToMongoDB = (url = process.env.ATLAS_URI, opts = {}) =>
    mongoose.connect(url, {
        ...opts,
        maxPoolSize: 50,
        connectTimeoutMS: 5000,
        useNewUrlParser: true,
    });

export default connectToMongoDB;
