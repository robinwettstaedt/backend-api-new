import express from 'express';
import controllers from './example.controllers.js';

const router = express.Router();

router.route('/').get(controllers.getMany);
//   .post(controllers.createOne);
//   .put(ExamplesCtrl.apiUpdateExample)
//   .delete(ExamplesCtrl.apiDeleteExample);

router.route('/:id').get(controllers.getOne).post(controllers.createOne);

export default router;
