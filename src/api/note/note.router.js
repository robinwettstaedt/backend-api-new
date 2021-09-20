import express from 'express';
import controllers from './note.controllers.js';

const router = express.Router();

router
  .route('/')
  .get(controllers.getMany)
  .post(controllers.createOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne);

router.route('/:id').get(controllers.getOne);

export default router;
