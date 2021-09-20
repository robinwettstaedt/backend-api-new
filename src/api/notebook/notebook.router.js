import express from 'express';
import controllers from './notebook.controllers.js';

const router = express.Router();

router
  .route('/')
  .get(controllers.getMany)
  .post(controllers.createOne)

  .delete(controllers.createOne);

router.route('/:id').get(controllers.getOne).put(controllers.createOne);

export default router;
