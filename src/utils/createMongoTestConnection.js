/* eslint-disable no-undef */
import mongoose from 'mongoose';

export const connectToTestMongo = async () => {
    mongoose.connect(process.env.LOCAL_MONGO_URI, {
        maxPoolSize: 50,
        connectTimeoutMS: 5000,
        useNewUrlParser: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
};

export const disconnectAndDropFromTestMongo = async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    await mongoose.connection.close();
};

export const disconnectFromTestMongo = async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
};
