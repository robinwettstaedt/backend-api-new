import app from './server.js';
import mongodb from 'mongodb';
import dotenv from 'dotenv';
import ExamplesDAO from './dao/examplesDAO.js';

dotenv.config();
const MongoClient = mongodb.MongoClient;

const port = process.env.PORT || 8000;

MongoClient.connect(process.env.ATLAS_URI, {
  maxPoolSize: 50,
  wtimeoutMS: 2500,
  useNewUrlParser: true,
})
  .catch((error) => {
    console.error('Error connecting with the cluster: ' + error);
    process.exit(1);
  })
  .then(async (client) => {
    await ExamplesDAO.injectDB(client);

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
