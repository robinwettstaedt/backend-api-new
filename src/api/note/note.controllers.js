import { Note } from './note.model.js';

const userHasAccess = (doc, user_id) => {
  const matchingUserID = doc.hasAccess.filter((docUserID) => {
    return docUserID.equals(user_id);
  });

  if (matchingUserID.length > 0) {
    return true;
  }
  return false;
};

// have to insert queries for each particular controller

export const getOne = (model) => async (req, res) => {
  try {
    // .lean() gets back POJO instead of mongoose object
    // If you're executing a query and sending the results without modification to, say, an Express response, you should use lean.
    // In general, if you do not modify the query results and do not use custom getters, you should use lean()
    const doc = await model
      .findOne({ _id: req.params.id })
      .select('-__v')
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

// maybe for getting all the notes in a specific notebook
// only question is about the users access
// should have access if able to send a request for that notebook though
// export const getMany = (model) => async (req, res) => {
//   try {
//     const docs = await model.find().lean().exec();

//     res.status(200).json(docs);
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

export const createOne = (model) => async (req, res) => {
  try {
    const note = req.body;

    note.hasAccess = [req.user._id];
    note.createdBy = [req.user._id];
    note.lastUpdatedBy = [req.user._id];

    const doc = await model.create(req.body);

    const { _doc } = doc;
    const { __v, ...rest } = _doc;
    const createdDoc = rest;

    res.status(201).json(createdDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
  try {
    const doc = await model.findOne({ _id: req.params.id }).lean().exec();

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
          return res.status(400).end();
        }
      }

      // update the document
      const updatedDoc = await model
        .findOneAndUpdate({ _id: req.params.id }, noteUpdates, { new: true })
        .select('-__v')
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
    const doc = await model.findOne({ _id: req.params.id }).lean().exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (userHasAccess(doc, req.user._id)) {
      const removed = await model
        .findOneAndRemove({ _id: req.params.id })
        .select('-__v')
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
  //   getMany: getMany(model),
  createOne: createOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
});

export default crudControllers(Note);
