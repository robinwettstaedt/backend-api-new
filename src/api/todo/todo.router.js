import express from 'express';
import controllers from './todo.controllers.js';

const router = express.Router();

router
  .route('/')
  .get(controllers.getMany)
  .post(controllers.createOne)
  .delete(controllers.removeMany);

router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne);

export default router;
