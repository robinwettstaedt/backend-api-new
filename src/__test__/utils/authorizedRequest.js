/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import { agent as supertest } from 'supertest';
// ---------^ this is the important part, using the agent itself.
import app from '../../app';
import loginUser from './loginUser';

const authorizedRequest = async (user) => {
    const agent = supertest(app);
    const accessToken = await loginUser(user);

    agent.auth(accessToken, { type: 'bearer' });
    return agent;
};

export default authorizedRequest;
