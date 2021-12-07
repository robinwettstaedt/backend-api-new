/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import dotenv from 'dotenv';
import { userWithAccess } from '../../../__test__/utils/testVariables';
import authorizedRequest from '../../../__test__/utils/authorizedRequest';

dotenv.config();

const userTestSuite = () => {
    describe('Test User Controllers', () => {
        describe('GET /api/v1/user', () => {
            test('responds with status code 200 & correct user information', async () => {
                const req = await authorizedRequest(userWithAccess);

                const response = await req.get('/api/v1/user');
                expect(response.statusCode).toBe(200);
                expect(response.body.user.username).toEqual(
                    userWithAccess.username
                );
            });
        });
    });
};

export default userTestSuite;
