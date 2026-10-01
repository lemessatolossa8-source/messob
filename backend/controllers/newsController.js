const News = require("../models/News");
const createCRUDController = require("./crudController");

module.exports = createCRUDController(News, "News");
