import connectToMongoDB from './utils/createMongoConnection';
import app from './app';

const start = async () => {
    try {
        connectToMongoDB();

        app.listen(process.env.PORT, () => {
            console.log(`REST API on http://localhost:${process.env.PORT}`);
        });
    } catch (e) {
        console.error(e);
    }
};

export default start;
