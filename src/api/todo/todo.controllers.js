import { Todo } from './todo.model.js';

export const getOne = (model) => async (req, res) => {
  try {
    const doc = await model
      .findOne({ _id: req.params.id })
      .select('-__v')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    res.status(200).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const getMany = (model) => async (req, res) => {
  try {
    const docs = await model
      .find({ createdBy: req.user._id })
      .lean()
      .select('-__v')
      .exec();

    if (!docs) {
      return res.status(404).end();
    }

    res.status(200).json(docs);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const createOne = (model) => async (req, res) => {
  try {
    const todo = req.body;

    todo.createdBy = req.user._id;

    const createdDoc = await model.create(todo);

    const doc = await model
      .findOne({ _id: createdDoc._id })
      .select('-__v')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
  try {
    const todoUpdates = req.body;

    const updatedDoc = await model
      .findOneAndUpdate({ _id: req.params.id }, todoUpdates, { new: true })
      .select('-__v')
      .exec();

    if (!updatedDoc) {
      return res.status(404).end();
    }

    res.status(200).json(updatedDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeOne = (model) => async (req, res) => {
  try {
    const removedDoc = await model
      .findOneAndRemove({ _id: req.params.id })
      .select('-__v')
      .exec();

    if (!removedDoc) {
      return res.status(404).end();
    }

    res.status(200).json(removedDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

// see if that somehow works #######################################################################
// remove all where createdBy === user._id && dueDate is older than today - 48? hrs
export const removeMany = (model) => async (req, res) => {
  try {
    const doc = await model
      .findOne({ _id: req.params.id })
      .select('-__v')
      .populate('hasAccess', '_id email firstName picture')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (userHasAccess(doc, req.user._id)) {
      const removed = await model
        .findOneAndRemove({ _id: req.params.id })
        .select('-__v')
        .populate('hasAccess', '_id email firstName picture')
        .exec();

      if (!removed) {
        return res.status(404).end();
      }

      return res.status(200).json(removed);
    }

    res.status(403).end();
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
  removeMany: removeMany(model),
});

export default crudControllers(Todo);
