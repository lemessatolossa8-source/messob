const Service = require("../models/Service");
const createCRUDController = require("./crudController");

module.exports = createCRUDController(Service, "Service");
