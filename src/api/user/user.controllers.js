import { User } from './user.model.js';

export const getOne = (model) => async (req, res) => {
  try {
    const user = req.user; // user object that gets attached by the protect() middleware
    res.status(200).send({ user: user });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
  try {
    const user = req.user;
    const updateData = req.body;
    // findOneAndUpdate returns a document whereas updateOne does not (it just returns the _id if it has created a new document).
    const updatedDoc = await model
      .findOneAndUpdate(user, updateData, { new: true })
      .select('-password -googleToken -tokenVersion -__v')
      .lean()
      .exec();

    if (!updatedDoc) {
      return res.status(400).end();
    }

    res.status(200).json({ data: updatedDoc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeOne = (model) => async (req, res) => {
  try {
    const user = req.user;
    // removed == the removed document (if any)
    const removed = await model
      .findOneAndRemove(user)
      .select('-password -googleToken -tokenVersion -__v')
      .lean()
      .exec();

    if (!removed) {
      return res.status(404).end();
    }

    res.status(200).json(removed);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const crudControllers = (model) => ({
  getOne: getOne(model),
  //   getMany: getMany(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
});

export default crudControllers(User);
