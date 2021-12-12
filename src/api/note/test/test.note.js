/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/variables/userVariables';

const noteTestSuite = () => {
    describe('Test Note Controllers', () => {
        describe('GET /api/v1/note', () => {
            describe('fetches user data for the first user', () => {
                test('responds with status code 200 & correct user information', async () => {
                    const authedReq = await authorizedRequest(userWithAccess);

                    const response = await authedReq.get('/api/v1/user');
                    expect(response.statusCode).toBe(200);
                    expect(response.body.user.username).toEqual(
                        userWithAccess.username
                    );
                });
            });
        });
    });
};

export default noteTestSuite;
