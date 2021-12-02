/* eslint-disable no-undef */
import authenticationTestSuite from '../api/authentication/test/authentication.test';
import {
    connectToTestMongo,
    disconnectAndDropFromTestMongo,
} from '../utils/createMongoTestConnection';

describe('run all tests sequentially', () => {
    beforeAll(async () => {
        connectToTestMongo();
    });

    afterAll(async () => {
        disconnectAndDropFromTestMongo();
    });
    authenticationTestSuite();
});
