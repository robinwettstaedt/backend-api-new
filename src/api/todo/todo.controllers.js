import { Todo } from './todo.model.js';

export const getOne = (model) => async (req, res) => {
  try {
    // .lean() gets back POJO instead of mongoose object
    // If you're executing a query and sending the results without modification to, say, an Express response, you should use lean.
    // In general, if you do not modify the query results and do not use custom getters, you should use lean()
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
      return res.status(200).json(doc);
    }

    res.status(403).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const getMany = (model) => async (req, res) => {
  try {
    const docs = await model.find({ notebook: req.params.id }).lean().exec();

    if (!docs) return res.status(404).end();

    res.status(200).json(docs);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const createOne = (model) => async (req, res) => {
  try {
    const note = req.body;

    note.hasAccess = [req.user._id];
    note.createdBy = [req.user._id];
    note.lastUpdatedBy = [req.user._id];

    const createdDoc = await model.create(note);

    // updating the notebook entry so that it featues this note's id
    const updatedNotebook = await Notebook.findOneAndUpdate(
      { _id: createdDoc.notebook },
      { $push: { notes: createdDoc._id } }
    ).exec();

    // update the note's hasAccess to feature everyone in the notebooks has Access

    createdDoc.hasAccess = updatedNotebook.hasAccess;
    await createdDoc.save();

    const doc = await model
      .findOne({ _id: createdDoc._id })
      .select('-__v')
      .populate('hasAccess', '_id email firstName picture')
      .lean()
      .exec();

    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
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
      const noteUpdates = req.body;

      // check for deletion status
      if (noteUpdates.deleted === true) {
        noteUpdates.deletedAt = Date.now();
      }
      if (noteUpdates.deleted === false) {
        noteUpdates.deletedAt = null;
      }

      if (noteUpdates.content) {
        if (doc.locked === true) {
          return res.status(400).json({
            message: 'Note content can not be changed as the Note is locked',
          });
        }
      }

      // updates to the hasAccess fields are handled by different routes
      if (noteUpdates.hasAccess) {
        delete noteUpdates.hasAccess;
      }

      // update the document
      const updatedDoc = await model
        .findOneAndUpdate({ _id: req.params.id }, noteUpdates, { new: true })
        .select('-__v')
        .populate('hasAccess', '_id email firstName picture')
        .exec();

      if (!updatedDoc) {
        return res.status(404).end();
      }

      return res.status(200).json(updatedDoc);
    }

    res.status(403).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeOne = (model) => async (req, res) => {
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

// see if that somehow works #######################################################################
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
