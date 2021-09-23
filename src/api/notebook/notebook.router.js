import express from 'express';
import controllers from './notebook.controllers.js';

const router = express.Router();

router
  .route('/')
  // .get(controllers.getMany)
  .post(controllers.createOne);

router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne);

router.route('/:id/access/add').put(controllers.addToHasAccess);
router.route('/:id/access/remove').put(controllers.removeFromHasAccess);

export default router;
