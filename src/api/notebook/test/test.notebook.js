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
    blueNotebook,
} from '../../../__test__/utils/variables/notebookVariables';

let REDNOTEBOOKID;
let GREENNOTEBOOKID;
let BLUENOTEBOOKID;

const notebookTestSuite = () => {
    describe('Test Notebook Controllers', () => {
        describe('POST /api/v1/notebook', () => {
            describe('creating new notebooks', () => {
                test('(redNotebook) responds with status code 201 & correct notebook information', async () => {
                    const authedReq = await authorizedRequest(userWithAccess);

                    const response = await authedReq
                        .post('/api/v1/notebook')
                        .send({
                            title: redNotebook.title,
                            color: redNotebook.color,
                        });

                    REDNOTEBOOKID = response.body._id;

                    expect(response.statusCode).toBe(201);
                    expect(response.body.hasAccess[0].email).toEqual(
                        userWithAccess.email
                    );
                    expect(response.body.notes).toEqual([]);
                    expect(response.body.createdBy).toEqual(
                        response.body.hasAccess[0]._id
                    );
                    expect(response.body.deleted).toEqual(false);
                    expect(response.body.visible).toEqual(true);
                    expect(response.body.color).toEqual(redNotebook.color);
                    expect(response.body.title).toEqual(redNotebook.title);
                });

                test('(greenNotebook) responds with status code 201 & correct notebook information', async () => {
                    const authedReq = await authorizedRequest(userWithAccess);

                    const response = await authedReq
                        .post('/api/v1/notebook')
                        .send({
                            title: greenNotebook.title,
                            color: greenNotebook.color,
                        });

                    GREENNOTEBOOKID = response.body._id;

                    expect(response.statusCode).toBe(201);
                    expect(response.body.hasAccess[0].email).toEqual(
                        userWithAccess.email
                    );
                    expect(response.body.notes).toEqual([]);
                    expect(response.body.createdBy).toEqual(
                        response.body.hasAccess[0]._id
                    );
                    expect(response.body.deleted).toEqual(false);
                    expect(response.body.visible).toEqual(true);
                    expect(response.body.color).toEqual(greenNotebook.color);
                    expect(response.body.title).toEqual(greenNotebook.title);
                });

                test('(blueNotebook) responds with status code 201 & correct notebook information', async () => {
                    const authedReq = await authorizedRequest(
                        secondUserWithAccess
                    );

                    const response = await authedReq
                        .post('/api/v1/notebook')
                        .send({
                            title: blueNotebook.title,
                            color: blueNotebook.color,
                        });

                    BLUENOTEBOOKID = response.body._id;

                    expect(response.statusCode).toBe(201);
                    expect(response.body.hasAccess[0].email).toEqual(
                        secondUserWithAccess.email
                    );
                    expect(response.body.notes).toEqual([]);
                    expect(response.body.createdBy).toEqual(
                        response.body.hasAccess[0]._id
                    );
                    expect(response.body.deleted).toEqual(false);
                    expect(response.body.visible).toEqual(true);
                    expect(response.body.color).toEqual(blueNotebook.color);
                    expect(response.body.title).toEqual(blueNotebook.title);
                });

                test('(color is not a hex value) responds with status code 400', async () => {
                    const authedReq = await authorizedRequest(
                        secondUserWithAccess
                    );

                    const response = await authedReq
                        .post('/api/v1/notebook')
                        .send({
                            title: blueNotebook.title,
                            color: 'blue',
                        });

                    expect(response.statusCode).toBe(400);
                    expect(response.body.message).toMatch(/hex string/);
                });

                test('(title missing) responds with status code 400', async () => {
                    const authedReq = await authorizedRequest(
                        secondUserWithAccess
                    );

                    const response = await authedReq
                        .post('/api/v1/notebook')
                        .send({
                            color: blueNotebook.color,
                        });

                    expect(response.statusCode).toBe(400);
                });
            });

            describe('PUT /api/v1/notebook/:id', () => {
                test('updates the note, responds with status code 200', async () => {
                    const authedReq = await authorizedRequest(userWithAccess);

                    const response = await authedReq
                        .put(`/api/v1/notebook/${REDNOTEBOOKID}`)
                        .send({
                            title: redNotebook.title,
                            color: redNotebook.color,
                            deleted: true,
                        });
                });

                test('note gets marked as deleted, responds with status code 200', async () => {});
            });
        });
    });
};

export default notebookTestSuite;
