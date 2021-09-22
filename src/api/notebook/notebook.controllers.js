import { Notebook } from './notebook.model.js';

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
      .populate('notes', '_id title emoji deleted deletedAt visible')
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

// export const getMany = (model) => async (req, res) => {
//   try {
//     const docs = await model.find().lean().exec();

//     res.status(200).json( docs );
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

export const createOne = (model) => async (req, res) => {
  try {
    const notebook = req.body;

    notebook.hasAccess = [req.user._id];
    notebook.createdBy = [req.user._id];

    const doc = await model.create(notebook);

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
      const notebookUpdates = req.body;

      // check for deletion status
      if (notebookUpdates.deleted === true) {
        notebookUpdates.deletedAt = Date.now();
      }
      if (notebookUpdates.deleted === false) {
        notebookUpdates.deletedAt = null;
      }

      // updates to the hasAccess fields are handled by different routes
      if (notebookUpdates.hasAccess) {
        delete notebookUpdates.hasAccess;
      }

      // client wants to alter the hasAccess field
      // make sure it always includes the client
      //   if (notebookUpdates.hasAccess) {
      //     if (!notebookUpdates.hasAccess.includes(req.user._id)) {
      //       notebookUpdates.hasAccess.push(req.user._id);
      //     }
      //     if (!notebookUpdates.hasAccess.includes(doc.createdBy)) {
      //       notebookUpdates.hasAccess.push(doc.createdBy);
      //     }
      //   }

      if (notebookUpdates.hasAccess) {
        if (req.user._id !== doc.createdBy) {
          //   notebookUpdates.hasAccess === [];
          delete notebookUpdates.hasAccess;
        }
        if (!notebookUpdates.hasAccess.includes(doc.createdBy)) {
          notebookUpdates.hasAccess.push(doc.createdBy);
        }
      }

      // update the document
      const updatedDoc = await model
        .findOneAndUpdate({ _id: req.params.id }, notebookUpdates, {
          new: true,
        })
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

export const addToHasAccess = (model) => async (req, res) => {
  try {
    const doc = await model.findOne({ _id: req.params.id }).lean().exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (!doc.createdBy.equals(req.user._id)) {
      return res.status(403).end();
    }

    const accessUpdates = req.body;

    if (!accessUpdates.hasAccess) {
      return res.status(400).end();
    }

    doc.hasAccess.push(accessUpdates.hasAccess);
    const updatedDoc = await doc.save();

    // update the document
    // const updatedDoc = await model
    //   .findOneAndUpdate({ _id: req.params.id }, notebookUpdates, {
    //     new: true,
    //   })
    //   .select('-__v')
    //   .exec();

    // if (!updatedDoc) {
    //   return res.status(404).end();
    // }

    res.status(200).json(updatedDoc);
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
  addToHasAccess: addToHasAccess(model),
});

export default crudControllers(Notebook);
