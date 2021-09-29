import { Notebook } from './notebook.model.js';
import { Note } from '../note/note.model.js';

const userHasAccess = (doc, user_id) => {
  const matchingUserID = doc.hasAccess.filter((docUserObj) => {
    return docUserObj._id.equals(user_id);
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
    notebook.createdBy = req.user._id;

    const createdDoc = await model.create(notebook);

    const doc = await model
      .findOne({ _id: createdDoc._id })
      .select('-__v')
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
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
    const doc = await model
      .findOne({ _id: req.params.id })
      .select('-__v')
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
      .lean()
      .exec();

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

      // update the document
      const updatedDoc = await model
        .findOneAndUpdate({ _id: req.params.id }, notebookUpdates, {
          new: true,
        })
        .select('-__v')
        .populate('notes', '_id title emoji deleted deletedAt visible')
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
      .populate('notes', '_id title emoji deleted deletedAt visible')
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
        .populate('notes', '_id title emoji deleted deletedAt visible')
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

export const addToHasAccess = (model) => async (req, res) => {
  try {
    const doc = await model.findOne({ _id: req.params.id }).lean().exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (!doc.createdBy.equals(req.user._id)) {
      return res.status(403).end();
    }

    const userToAdd = req.body._id;
    const oldAccessArray = doc.hasAccess;

    if (!userToAdd) {
      return res.status(400).json({
        message: 'No valid user to remove was given in the request body',
      });
    }

    // check if the user is included in the old access array
    const alreadyHasAccess = oldAccessArray.filter((oldUser) => {
      return oldUser.toString() === userToAdd;
    });

    if (alreadyHasAccess.length > 0) {
      return res.status(400).json({
        message: 'User does already have access',
      });
    }

    // append the new user to the old access array
    oldAccessArray.push(userToAdd);

    // renaming the array
    const newAccessArray = oldAccessArray;

    // update the document
    const updatedDoc = await model
      .findOneAndUpdate(
        { _id: req.params.id },
        { hasAccess: newAccessArray },
        {
          new: true,
        }
      )
      .select('-__v')
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
      .exec();

    if (!updatedDoc) {
      return res.status(404).end();
    }

    // iterate over the note ids that are given on the Notebook doc and update their hasAccess field
    for (const noteID of updatedDoc.notes) {
      await Note.updateOne({ _id: noteID }, { hasAccess: newAccessArray });
    }

    res.status(200).json(updatedDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeFromHasAccess = (model) => async (req, res) => {
  try {
    const doc = await model.findOne({ _id: req.params.id }).lean().exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (!doc.createdBy.equals(req.user._id)) {
      return res.status(403).end();
    }

    const userToRemove = req.body._id;
    const oldAccessArray = doc.hasAccess;

    if (!userToRemove) {
      return res.status(400).json({
        message: 'No valid user to remove was given in the request body',
      });
    }

    if (doc.createdBy.equals(userToRemove)) {
      return res.status(400).json({
        message: 'Can not remove self from having access to the document',
      });
    }

    // filter out the user to remove
    const removedFromAccessArray = oldAccessArray.filter((oldUser) => {
      return oldUser.toString() !== userToRemove;
    });

    // if the array did not get smaller through filtering, the user to remove did not have access
    if (removedFromAccessArray.length === oldAccessArray.length) {
      return res.status(400).json({
        message: 'User to be removed from having access has no access',
      });
    }

    // update the document
    const updatedDoc = await model
      .findOneAndUpdate(
        { _id: req.params.id },
        { hasAccess: removedFromAccessArray },
        {
          new: true,
        }
      )
      .select('-__v')
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
      .exec();

    if (!updatedDoc) {
      return res.status(404).end();
    }

    // iterate over the note ids that are given on the Notebook doc and update their hasAccess field
    for (const noteID of updatedDoc.notes) {
      await Note.updateOne(
        { _id: noteID },
        { hasAccess: removedFromAccessArray }
      );
    }

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
  removeFromHasAccess: removeFromHasAccess(model),
});

export default crudControllers(Notebook);
