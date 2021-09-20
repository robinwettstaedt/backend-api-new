import { UserRefreshClient } from 'google-auth-library';
import { Notebook } from './notebook.model.js';

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

    const matchingUserID = doc.hasAccess.filter((user_id) => {
      return user_id.equals(req.user._id);
    });

    if (matchingUserID.length > 0) {
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

    const matchingUserID = doc.hasAccess.filter((user_id) => {
      return user_id.equals(req.user._id);
    });

    if (matchingUserID.length > 0) {
      // findOneAndUpdate returns a document whereas updateOne does not (it just returns the _id if it has created a new document).
      const updatedDoc = await model
        .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
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
    // removed == the removed document (if any)
    const removed = await model.findOneAndRemove().exec();

    if (!removed) {
      return res.status(400).end();
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
  createOne: createOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
});

export default crudControllers(Notebook);
