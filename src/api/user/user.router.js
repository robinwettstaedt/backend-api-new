import express from 'express';
import controllers from './user.controllers.js';

const router = express.Router();

router
  .route('/')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne);

export default router;
