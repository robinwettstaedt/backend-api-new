/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/variables/userVariables';

import {
    greenNotebook,
    redNotebook,
} from '../../../__test__/utils/variables/notebookVariables';

import {
    firstNote,
    secondNote,
} from '../../../__test__/utils/variables/noteVariables';

const noteTestSuite = () => {
    describe('Test Note Controllers', () => {
        beforeAll(async () => {
            const authedReq = await authorizedRequest(userWithAccess);

            const response = await authedReq.get('/api/v1/notebook');

            redNotebook._id = response.body[0]._id;
            greenNotebook._id = response.body[1]._id;
        });

        describe('POST /api/v1/note', () => {
            test('creates the first note on the redNotebook', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.post('/api/v1/note').send({
                    title: firstNote.title,
                    content: firstNote.content,
                    notebook: redNotebook._id,
                    emoji: firstNote.emoji,
                });

                firstNote._id = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.hasAccess[0].email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.createdBy).toEqual(
                    response.body.hasAccess[0]._id
                );
                expect(response.body.visible).toEqual(true);
                expect(response.body.deleted).toEqual(false);
            });

            test('creates the second note on the redNotebook', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.post('/api/v1/note').send({
                    title: secondNote.title,
                    content: secondNote.content,
                    notebook: redNotebook._id,
                    emoji: secondNote.emoji,
                });

                secondNote._id = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.hasAccess[0].email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.createdBy).toEqual(
                    response.body.hasAccess[0]._id
                );
                expect(response.body.visible).toEqual(true);
                expect(response.body.deleted).toEqual(false);
            });

            test("Notebook's notes field has been updated", async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.get(
                    `/api/v1/notebook/${redNotebook._id}`
                );

                expect(response.statusCode).toBe(200);
                expect(response.body.notes[0]._id).toEqual(firstNote._id);
                expect(response.body.notes[1]._id).toEqual(secondNote._id);
            });
        });

        describe('DELETE /api/v1/note/:id', () => {
            test('secondNote gets deleted', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.delete(
                    `/api/v1/note/${secondNote._id}`
                );

                expect(response.body._id).toEqual(secondNote._id);
                expect(response.statusCode).toBe(200);
            });

            test("Notebook's notes field has been updated", async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.get(
                    `/api/v1/notebook/${redNotebook._id}`
                );

                expect(response.statusCode).toBe(200);
                expect(response.body.notes[0]._id).toEqual(firstNote._id);
                expect(response.body.notes[1]).toBeUndefined();
            });
        });
    });
};

/**
 * create Notes
 * check if Notebook's notes field has updated
 *
 * delete note
 * check if Notebook's notes field has updated
 *
 *
 * INVITE SYSTEM:
 *
 * add secondUser to Note's hasAccess
 *
 * remove secondUser from Note's hasAccess
 *
 * add secondUser to Notebook's hasAccess
 * check if Note's hasAccess has been cascadingly updated
 *
 * remove secondUser from Notebook's hasAccess
 * check if Note's hasAccess has been cascadingly updated
 *
 *
 */

export default noteTestSuite;
