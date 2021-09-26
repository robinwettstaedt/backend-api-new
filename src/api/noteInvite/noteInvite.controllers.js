import { NoteInvite } from './noteInvite.model.js';

export const getMany = (model) => async (req, res) => {
  try {
    docs = await model.find({ notebook: req.body._id }).lean().exec();

    if (!docs) return res.status(404).end();

    res.status(200).json(docs);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

// const crudControllers = (model) => ({
//   getMany: getMany(model),
//   createOne: createOne(model),
//   removeOne: removeOne(model),
//   acceptOne: acceptOne(model),
//   declineOne: declineOne(model),
// });

// export default crudControllers(NoteInvite);
