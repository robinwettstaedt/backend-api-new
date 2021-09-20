import { User } from './user.model.js';

export const getOne = (model) => async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    res.status(200).send({ user: user });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

// export const getMany = (model) => async (req, res) => {
//   try {
//     const docs = await model.find().lean().exec();

//     res.status(200).json({ data: docs });
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

export const createOne = (model) => async (req, res) => {
  try {
    const doc = await model.create({ content: req.body.content });
    res.status(201).json({ data: doc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

// export const updateOne = (model) => async (req, res) => {
//   try {
//     // findOneAndUpdate returns a document whereas updateOne does not (it just returns the _id if it has created a new document).
//     const updatedDoc = await model.findOneAndUpdate().exec();

//     if (!updatedDoc) {
//       return res.status(400).end();
//     }

//     res.status(200).json({ data: updatedDoc });
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

// export const removeOne = (model) => async (req, res) => {
//   try {
//     // removed == the removed document (if any)
//     const removed = await model.findOneAndRemove().exec();

//     if (!removed) {
//       return res.status(400).end();
//     }

//     return res.status(200).json({ data: removed });
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

const crudControllers = (model) => ({
  getOne: getOne(model),
  //   getMany: getMany(model),
  createOne: createOne(model),
  //   updateOne: updateOne(model),
  //   removeOne: removeOne(model),
});

export default crudControllers(User);
