import express from 'express';
import ExamplesCtrl from './examples.controller.js';

const router = express.Router();

router
  .route('/')
  .get(ExamplesCtrl.apiGetExamples)
  .post(ExamplesCtrl.apiPostExample);
//   .put(ExamplesCtrl.apiUpdateExample)
//   .delete(ExamplesCtrl.apiDeleteExample);

export default router;
