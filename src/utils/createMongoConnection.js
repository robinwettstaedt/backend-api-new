/* eslint-disable no-console */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToMongoDB = (opts = {}) => {
    try {
        let url = '';

        if (process.env.NODE_ENV === 'production') {
            url = process.env.ATLAS_URI;
        }
        if (process.env.NODE_ENV === 'testing') {
            url = process.env.LOCAL_MONGO_URI;
        }
        if (process.env.NODE_ENV === 'development') {
            url = process.env.LOCAL_MONGO_URI;
        }

        mongoose.connect(url, {
            ...opts,
            maxPoolSize: 50,
            connectTimeoutMS: 5000,
            useNewUrlParser: true,
        });

        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error: '));
        db.once('open', () => {
            console.log('Connected successfully');
        });
    } catch (error) {
        console.log(error);
    }
};

export default connectToMongoDB;
