let examples; // reference to the examples db

export default class ExamplesDAO {
  static async injectDB(conn) {
    if (examples) {
      return;
    }

    try {
      examples = await conn
        .db(process.env.EXAMPLES_NS)
        .collection(process.env.EXAMPLES_COLLECTION);
    } catch (error) {
      console.error(
        `Unable to establish a connection to the database ${process.env.EXAMPLES_NS}` +
          error
      );
    }
  }

  static async getExamples({
    filters = null,
    page = 0,
    documentsPerPage = 20,
  } = {}) {
    let query;
    if (filters) {
      if ('name' in filters) {
        query = { $text: { $search: filters['name'] } };
      } else if ('cuisine' in filters) {
        query = { cuisine: { $eq: filters['cuisine'] } };
      } else if ('zipcode' in filters) {
        query = { 'adress.zipcode': { $eq: filters['zipcode'] } };
      }
    }

    let cursor;

    try {
      cursor = await examples.find(query);
    } catch (error) {
      console.error(error);
      return { examplesList: [], totalNumExamples: 0 };
    }

    const displayCursor = cursor
      .limit(documentsPerPage)
      .skip(documentsPerPage * page);

    try {
      const examplesList = await displayCursor.toArray();
      const totalNumExamples = await examples.countDocuments(query);

      return { examplesList, totalNumExamples };
    } catch (error) {
      console.error(error);

      return { examplesList: [], totalNumExamples: 0 };
    }
  }

  static async postExample(userName, userID, text, date) {
    try {
      const exampleDocument = {
        name: userName,
        user_id: userID,
        date: date,
        text: text,
      };

      return await examples.insertOne(exampleDocument);
    } catch (e) {
      console.error(`Unable to post example: ${e}`);
      return { error: e };
    }
  }
}
