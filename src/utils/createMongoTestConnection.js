/* eslint-disable no-undef */
import mongoose from 'mongoose';

export const connectToTestMongo = async () => {
    mongoose.connect('mongodb://localhost:27017', {
        maxPoolSize: 50,
        connectTimeoutMS: 5000,
        useNewUrlParser: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
};

export const disconnectFromTestMongo = async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
};
