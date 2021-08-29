import ExamplesDAO from '../dao/examplesDAO.js';

export default class ExamplesController {
  static async apiGetExamples(req, res, next) {
    const documentsPerPage = req.query.documentPerPage
      ? parseInt(req.query.documentsPerPage, 10)
      : 20;
    const page = req.query.page ? parseInt(req.query.page, 10) : 0;

    let filters = {};
    if (req.query.cuisine) {
      filters.cuisine = req.query.cuisine;
    } else if (req.query.zipcode) {
      filters.zipcode = req.query.zipcode;
    } else if (req.query.name) {
      filters.name = req.query.name;
    }

    const { examplesList, totalNumExamples } = await ExamplesDAO.getExamples({
      filters,
      page,
      documentsPerPage,
    });

    let response = {
      examples: examplesList,
      page: page,
      filters: filters,
      entries_per_page: documentsPerPage,
      total_results: totalNumExamples,
    };
    res.json(response);
  }

  static async apiGetRestaurantById(req, res, next) {
    try {
      let id = req.params.id || {};
      let restaurant = await RestaurantsDAO.getRestaurantByID(id);
      if (!restaurant) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json(restaurant);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetRestaurantCuisines(req, res, next) {
    try {
      let cuisines = await RestaurantsDAO.getCuisines();
      res.json(cuisines);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiPostExample(req, res, next) {
    try {
      const text = req.body.text;
      const name = req.body.name;
      const id = req.body.user_id;
      const date = new Date();

      const ExampleResponse = await ExamplesDAO.postExample(
        name,
        id,
        text,
        date
      );
      res.json({ status: 'success' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}
