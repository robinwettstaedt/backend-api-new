/* eslint-disable no-undef */
import authenticationTestSuite from '../api/authentication/test/test.authentication';
import userTestSuite from '../api/user/test/test.user';
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

    userTestSuite();
});
