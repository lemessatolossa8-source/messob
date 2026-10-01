const Branch = require("../models/Branch");
const createCRUDController = require("./crudController");

module.exports = createCRUDController(Branch, "Branch");
