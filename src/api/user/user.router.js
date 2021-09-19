import express from 'express';
import controllers from './user.controllers.js';

const router = express.Router();

router.route('/').get(controllers.getOne);

export default router;
