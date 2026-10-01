const Announcement = require("../models/Announcement");
const createCRUDController = require("./crudController");

module.exports = createCRUDController(Announcement, "Announcement");
