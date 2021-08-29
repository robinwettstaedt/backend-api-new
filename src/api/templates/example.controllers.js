import { Example } from './example.model.js';

// have to insert queries for each particular controller

export const getOne = (model) => async (req, res) => {
  try {
    const doc = await model.findOne({ _id: req.params.id }).lean().exec();

    if (!doc) {
      return res.status(400).end();
    }

    res.status(200).json({ data: doc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const getMany = (model) => async (req, res) => {
  try {
    const docs = await model.find().lean().exec();

    res.status(200).json({ data: docs });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const createOne = (model) => async (req, res) => {
  try {
    const doc = await model.create({ name: req.body.name });
    res.status(201).json({ data: doc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
  try {
    const updatedDoc = await model.findOneAndUpdate().lean().exec();

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
    const removed = await model.findOneAndRemove().exec();

    if (!removed) {
      return res.status(400).end();
    }

    return res.status(200).json({ data: removed });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const crudControllers = (model) => ({
  getOne: getOne(model),
  getMany: getMany(model),
  createOne: createOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
});

export default crudControllers(Example);
