/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
} from '../../../__test__/utils/variables/userVariables';

import { redNotebook } from '../../../__test__/utils/variables/notebookVariables';

import { firstNote } from '../../../__test__/utils/variables/noteVariables';

const noteInviteTestSuite = () => {
    describe('Test NoteInvite Controllers', () => {
        beforeAll(async () => {
            const authedReq = await authorizedRequest(secondUserWithAccess);

            const response = await authedReq.get('/api/v1/user');

            secondUserWithAccess._id = response.body.user._id;
        });

        beforeAll(async () => {
            const authedReq = await authorizedRequest(userWithAccess);

            const response = await authedReq.get('/api/v1/notebook');

            redNotebook._id = response.body[0]._id;

            redNotebook.notes = response.body[0].notes;
            firstNote._id = redNotebook.notes[0]._id;
        });

        describe('POST /api/v1/note/:id/invites', () => {
            test(`invites the secondUserWithAccess to the firstNote`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: secondUserWithAccess._id });

                expect(response.statusCode).toBe(201);
                expect(response.body.receiver._id).toEqual(
                    secondUserWithAccess._id
                );
                expect(response.body.inviter.email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.note).toEqual(firstNote._id);
            });
        });
    });
};

export default noteInviteTestSuite;

/**
 *
 * Checklist:
 *
 * invite secondUser to firstNote
 * accept invite with secondUser
 * add secondUser to firstNote's hasAccess
 * check that secondUser can update firstNote
 *
 * remove secondUser from firstNote's hasAccess
 * check that secondUser can not update firstNote
 *
 * invite secondUser to redNotebook
 * accept with secondUser
 * check if firstNote's hasAccess has been cascadingly updated
 * check that secondUser can update firstNote
 *
 * remove secondUser from redNotebook's hasAccess
 * check if firstNote's hasAccess has been cascadingly updated
 * check that secondUser can not update firstNote anymore
 *
 *
 */
