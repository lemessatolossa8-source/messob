const { Op, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const Floor = require("../models/Floor");
const FloorService = require("../models/FloorService");
const { autoTranslateModelData } = require("../utils/autoTranslator");

// Safely delete an uploaded file referenced as "/uploads/<filename>"
const deleteUploadedFile = (imageValue) => {
  try {
    if (typeof imageValue !== "string") return;
    const match = imageValue.match(/^\/?uploads\/([^/\\?#]+)$/i);
    if (!match) return;
    const filePath = path.join(__dirname, "..", "uploads", match[1]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn(`Failed to remove upload file for "${imageValue}":`, err.message);
  }
};

let publicFloorsCache = null;

function invalidateFloorCache() {
  publicFloorsCache = null;
}

/**
 * Get all floors
 * Public: returns only published floors and their published services
 * Admin: returns all floors and services (or filtered by status)
 */
const getAll = async (req, res) => {
  const isAuth = !!req.user;
  const { status } = req.query;

  // Serve unauthenticated requests from instant memory cache if available
  if (!isAuth && (!status || status === "published")) {
    if (publicFloorsCache) {
      res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
      return res.json({
        success: true,
        data: publicFloorsCache,
      });
    }
  }

  const floorWhere = {};
  if (!isAuth) {
    floorWhere.status = "published";
  } else if (status && status !== "all") {
    floorWhere.status = status;
  }

  const serviceWhere = {};
  if (!isAuth) {
    serviceWhere.status = "published";
  }

  const floors = await Floor.findAll({
    where: floorWhere,
    include: [
      {
        model: FloorService,
        as: "services",
        where: serviceWhere,
        required: false,
      },
    ],
    order: [
      ["order", "ASC"],
      ["floorNumber", "ASC"],
      [{ model: FloorService, as: "services" }, "order", "ASC"],
      [{ model: FloorService, as: "services" }, "id", "ASC"],
    ],
  });

  const data = floors.map((f) => f.toJSON());

  if (!isAuth && (!status || status === "published")) {
    publicFloorsCache = data;
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  } else {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  res.json({
    success: true,
    data,
  });
};

/**
 * Get floor by floor number (e.g. 1, 2, 3, 4)
 */
const getByNumber = async (req, res) => {
  const floorNum = parseInt(req.params.number, 10);
  if (isNaN(floorNum)) {
    return res.status(400).json({ success: false, message: "Invalid floor number" });
  }

  const isAuth = !!req.user;
  const floorWhere = { floorNumber: floorNum };
  if (!isAuth) {
    floorWhere.status = "published";
  }

  const serviceWhere = {};
  if (!isAuth) {
    serviceWhere.status = "published";
  }

  const floor = await Floor.findOne({
    where: floorWhere,
    include: [
      {
        model: FloorService,
        as: "services",
        where: serviceWhere,
        required: false,
      },
    ],
    order: [
      [{ model: FloorService, as: "services" }, "order", "ASC"],
      [{ model: FloorService, as: "services" }, "id", "ASC"],
    ],
  });

  if (!floor) {
    return res.status(404).json({ success: false, message: `Floor ${floorNum} not found` });
  }

  if (!isAuth) {
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  } else {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  res.json({
    success: true,
    data: floor.toJSON(),
  });
};

/**
 * Get floor by primary ID
 */
const getById = async (req, res) => {
  const isAuth = !!req.user;
  const serviceWhere = {};
  if (!isAuth) {
    serviceWhere.status = "published";
  }

  const floor = await Floor.findByPk(req.params.id, {
    include: [
      {
        model: FloorService,
        as: "services",
        where: serviceWhere,
        required: false,
      },
    ],
    order: [
      [{ model: FloorService, as: "services" }, "order", "ASC"],
      [{ model: FloorService, as: "services" }, "id", "ASC"],
    ],
  });

  if (!floor) {
    return res.status(404).json({ success: false, message: "Floor not found" });
  }

  if (!isAuth && floor.status !== "published") {
    return res.status(404).json({ success: false, message: "Floor not found" });
  }

  if (!isAuth) {
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  } else {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  res.json({
    success: true,
    data: floor.toJSON(),
  });
};

/**
 * Create a new floor
 */
const create = async (req, res) => {
  let payload = { ...req.body };

  // Parse JSON fields if strings
  ["title", "visitorInstructions"].forEach((k) => {
    if (typeof payload[k] === "string") {
      try {
        payload[k] = JSON.parse(payload[k]);
      } catch {}
    }
  });

  // Handle name
  if (typeof payload.name === "string") {
    try {
      payload.name = JSON.parse(payload.name);
    } catch {
      const trimmed = payload.name.trim();
      payload.name = { en: trimmed, am: "", om: "" };
    }
  }

  // Handle description
  if (typeof payload.description === "string") {
    try {
      payload.description = JSON.parse(payload.description);
    } catch {
      const trimmed = payload.description.trim();
      payload.description = { en: trimmed, am: "", om: "" };
    }
  }

  // Validate required fields: Floor Name and Description
  const nameStr =
    typeof payload.name === "object" && payload.name !== null
      ? (payload.name.en || payload.name.om || payload.name.am || "").trim()
      : String(payload.name || "").trim();

  if (!nameStr) {
    if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
    return res.status(400).json({ success: false, message: "Floor Name is required." });
  }

  const descStr =
    typeof payload.description === "object" && payload.description !== null
      ? (payload.description.en || payload.description.om || payload.description.am || "").trim()
      : String(payload.description || "").trim();

  if (!descStr) {
    if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
    return res.status(400).json({ success: false, message: "Description is required." });
  }

  payload = await autoTranslateModelData(payload);

  // Validate image
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowedExts.includes(ext)) {
      deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Supported formats are JPG, PNG, and WebP.",
      });
    }
    payload.image = `/uploads/${req.file.filename}`;
  } else if (!payload.image) {
    return res.status(400).json({
      success: false,
      message: "Floor Image is required. Please upload a JPG, PNG, or WebP image.",
    });
  }

  let floorNum = parseInt(payload.floorNumber, 10);
  if (isNaN(floorNum)) {
    const maxFloor = await Floor.max("floorNumber");
    floorNum = typeof maxFloor === "number" && !isNaN(maxFloor) ? maxFloor + 1 : 1;
  }
  payload.floorNumber = floorNum;

  if (!payload.order) {
    payload.order = floorNum;
  }
  if (!payload.status) {
    payload.status = "published";
  }

  const existing = await Floor.findOne({ where: { floorNumber: floorNum } });
  if (existing) {
    // If auto-calculated collided, find next available
    const allFloors = await Floor.findAll({ attributes: ["floorNumber"] });
    const taken = new Set(allFloors.map((f) => f.floorNumber));
    let nextNum = 1;
    while (taken.has(nextNum)) nextNum++;
    payload.floorNumber = nextNum;
    payload.order = nextNum;
  }

  const floor = await Floor.create(payload);
  invalidateFloorCache();
  res.status(201).json({
    success: true,
    message: "Floor created successfully",
    data: floor.toJSON(),
  });
};

/**
 * Update floor
 */
const update = async (req, res) => {
  const floor = await Floor.findByPk(req.params.id);
  if (!floor) {
    return res.status(404).json({ success: false, message: "Floor not found" });
  }

  let payload = { ...req.body };

  // Parse JSON fields if strings
  ["title", "visitorInstructions"].forEach((k) => {
    if (typeof payload[k] === "string") {
      try {
        payload[k] = JSON.parse(payload[k]);
      } catch {}
    }
  });

  // Handle name
  if (typeof payload.name === "string") {
    try {
      payload.name = JSON.parse(payload.name);
    } catch {
      const trimmed = payload.name.trim();
      payload.name = { en: trimmed, am: "", om: "" };
    }
  }

  // Handle description
  if (typeof payload.description === "string") {
    try {
      payload.description = JSON.parse(payload.description);
    } catch {
      const trimmed = payload.description.trim();
      payload.description = { en: trimmed, am: "", om: "" };
    }
  }

  if (payload.name && typeof payload.name === "object") {
    payload.name = {
      en: payload.name.en !== undefined ? payload.name.en : (floor.name?.en || ""),
      om: payload.name.om !== undefined ? payload.name.om : (floor.name?.om || ""),
      am: payload.name.am !== undefined ? payload.name.am : (floor.name?.am || ""),
    };
  }

  if (payload.description && typeof payload.description === "object") {
    payload.description = {
      en: payload.description.en !== undefined ? payload.description.en : (floor.description?.en || ""),
      om: payload.description.om !== undefined ? payload.description.om : (floor.description?.om || ""),
      am: payload.description.am !== undefined ? payload.description.am : (floor.description?.am || ""),
    };
  }

  if (payload.name !== undefined) {
    const nameStr =
      typeof payload.name === "object" && payload.name !== null
        ? (payload.name.en || payload.name.om || payload.name.am || "").trim()
        : String(payload.name || "").trim();
    if (!nameStr) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Floor Name cannot be empty." });
    }
  }

  if (payload.description !== undefined) {
    const descStr =
      typeof payload.description === "object" && payload.description !== null
        ? (payload.description.en || payload.description.om || payload.description.am || "").trim()
        : String(payload.description || "").trim();
    if (!descStr) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Description cannot be empty." });
    }
  }

  payload = await autoTranslateModelData(payload);

  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowedExts.includes(ext)) {
      deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Supported formats are JPG, PNG, and WebP.",
      });
    }
    if (floor.image) deleteUploadedFile(floor.image);
    payload.image = `/uploads/${req.file.filename}`;
  } else if (payload.removeImage === "true" || payload.image === "") {
    if (floor.image) deleteUploadedFile(floor.image);
    payload.image = "";
  } else if (payload.existingImage) {
    payload.image = payload.existingImage;
  }

  if (payload.floorNumber !== undefined) {
    const floorNum = parseInt(payload.floorNumber, 10);
    if (!isNaN(floorNum) && floorNum !== floor.floorNumber) {
      const existing = await Floor.findOne({ where: { floorNumber: floorNum } });
      if (existing && existing.id !== floor.id) {
        return res.status(400).json({ success: false, message: `Floor ${floorNum} already exists.` });
      }
      payload.floorNumber = floorNum;
    }
  }

  await floor.update(payload);
  invalidateFloorCache();
  const updated = await Floor.findByPk(floor.id, {
    include: [{ model: FloorService, as: "services" }],
  });

  res.json({
    success: true,
    message: "Floor updated successfully",
    data: updated.toJSON(),
  });
};

/**
 * Remove floor
 */
const remove = async (req, res) => {
  const floor = await Floor.findByPk(req.params.id);
  if (!floor) {
    return res.status(404).json({ success: false, message: "Floor not found" });
  }

  if (floor.image) {
    deleteUploadedFile(floor.image);
  }

  await floor.destroy();
  invalidateFloorCache();
  res.json({
    success: true,
    message: "Floor deleted successfully",
  });
};

/**
 * Get all services across all floors (for admin service manager)
 */
const getAllServices = async (req, res) => {
  const isAuth = !!req.user;
  const { floorId, status } = req.query;

  const where = {};
  if (!isAuth) {
    where.status = "published";
  } else if (status && status !== "all") {
    where.status = status;
  }

  if (floorId && floorId !== "all") {
    where.floorId = floorId;
  }

  const services = await FloorService.findAll({
    where,
    include: [
      {
        model: Floor,
        as: "floor",
        attributes: ["id", "floorNumber", "name", "title", "status"],
      },
    ],
    order: [
      [{ model: Floor, as: "floor" }, "floorNumber", "ASC"],
      ["order", "ASC"],
      ["id", "ASC"],
    ],
  });

  res.json({
    success: true,
    data: services.map((s) => s.toJSON()),
  });
};

/**
 * Add a service to a floor
 */
const addService = async (req, res) => {
  const floorId = req.params.id || req.body.floorId;
  if (!floorId) {
    return res.status(400).json({ success: false, message: "Floor ID is required" });
  }

  const floor = await Floor.findByPk(floorId);
  if (!floor) {
    return res.status(404).json({ success: false, message: "Target floor not found" });
  }

  let payload = { ...req.body, floorId: floor.id };

  ["name", "description", "department", "visitorInstructions"].forEach((k) => {
    if (typeof payload[k] === "string") {
      try {
        payload[k] = JSON.parse(payload[k]);
      } catch {}
    }
  });

  payload = await autoTranslateModelData(payload);

  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  } else if (payload.existingImage) {
    payload.image = payload.existingImage;
  }

  const service = await FloorService.create(payload);
  const created = await FloorService.findByPk(service.id, {
    include: [{ model: Floor, as: "floor", attributes: ["id", "floorNumber", "name"] }],
  });

  invalidateFloorCache();
  res.status(201).json({
    success: true,
    message: "Floor service added successfully",
    data: created ? created.toJSON() : service.toJSON(),
  });
};

/**
 * Update a floor service (supports floor reassignment & image update/removal)
 */
const updateService = async (req, res) => {
  const serviceId = req.params.serviceId;
  let service = null;

  if (req.params.id) {
    service = await FloorService.findOne({
      where: { id: serviceId, floorId: req.params.id },
    });
  }
  if (!service) {
    service = await FloorService.findByPk(serviceId);
  }

  if (!service) {
    return res.status(404).json({ success: false, message: "Floor service not found" });
  }

  let payload = { ...req.body };

  // If reassigning to a different floor
  if (payload.floorId) {
    const targetFloor = await Floor.findByPk(payload.floorId);
    if (!targetFloor) {
      return res.status(400).json({ success: false, message: "Target floor does not exist" });
    }
    payload.floorId = targetFloor.id;
  }

  ["name", "description", "department", "visitorInstructions"].forEach((k) => {
    if (typeof payload[k] === "string") {
      try {
        payload[k] = JSON.parse(payload[k]);
      } catch {}
    }
  });

  payload = await autoTranslateModelData(payload);

  if (req.file) {
    if (service.image) deleteUploadedFile(service.image);
    payload.image = `/uploads/${req.file.filename}`;
  } else if (payload.removeImage === "true" || payload.image === "") {
    if (service.image) deleteUploadedFile(service.image);
    payload.image = "";
  } else if (payload.existingImage) {
    payload.image = payload.existingImage;
  }

  await service.update(payload);
  invalidateFloorCache();
  const updated = await FloorService.findByPk(service.id, {
    include: [{ model: Floor, as: "floor", attributes: ["id", "floorNumber", "name"] }],
  });

  res.json({
    success: true,
    message: "Floor service updated successfully",
    data: updated ? updated.toJSON() : service.toJSON(),
  });
};

/**
 * Delete a floor service and remove its uploaded image
 */
const deleteService = async (req, res) => {
  const serviceId = req.params.serviceId;
  let service = null;

  if (req.params.id) {
    service = await FloorService.findOne({
      where: { id: serviceId, floorId: req.params.id },
    });
  }
  if (!service) {
    service = await FloorService.findByPk(serviceId);
  }

  if (!service) {
    return res.status(404).json({ success: false, message: "Floor service not found" });
  }

  if (service.image) {
    deleteUploadedFile(service.image);
  }

  await service.destroy();
  invalidateFloorCache();
  res.json({
    success: true,
    message: "Floor service and photo deleted successfully",
  });
};

/**
 * Reorder floor services
 */
const reorderServices = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: "Items array is required" });
  }

  for (const item of items) {
    if (item.id && typeof item.order === "number") {
      await FloorService.update(
        { order: item.order },
        { where: { id: item.id, floorId: req.params.id } }
      );
    }
  }

  const updated = await FloorService.findAll({
    where: { floorId: req.params.id },
    order: [["order", "ASC"]],
  });

  invalidateFloorCache();
  res.json({
    success: true,
    message: "Floor services reordered successfully",
    data: updated.map((s) => s.toJSON()),
  });
};

/**
 * Ensure default 4 floors exist with genuine editable placeholder data
 */
const ensureDefaultFloors = async () => {
  try {
    const count = await Floor.count();
    if (count > 0) return;

    console.log("ℹ️ Initializing 4-Floor directory in MySQL...");

    const defaultFloors = [
      {
        floorNumber: 1,
        order: 1,
        status: "published",
        name: {
          om: "Darbii 1ffaa",
          en: "Floor 1",
          am: "1ኛ ፎቅ",
        },
        title: {
          om: "Simannaa, Qajeelfama Daawwattootaa fi Taateewwan Murteessoo",
          en: "Reception, Visitor Guidance & Vital Events Registration",
          am: "የመስተንግዶ፣ የጎብኚዎች መመሪያ እና የወሳኝ ኩነቶች ምዝገባ",
        },
        description: {
          om: "Darbii tokkooffaan wirtuu simannaa lammilee, qajeelfama odeeffannoo tajaajilaa, akkasumas galmeessa taateewwan murteessoo (dhaloota, gaa'ila, ragaa du'aa) fi waraqaa eenyummaa lammilee ta'ee tajaajila.",
          en: "The first floor serves as the main citizen reception, official public information desk, and center for vital events registration (birth, marriage, death records) and citizen identification.",
          am: "አንደኛ ፎቅ እንደ ዋናው የዜጎች መቀበያ፣ ይፋዊ የህዝብ መረጃ መስጫ ዴስክ እና የወሳኝ ኩነቶች ምዝገባ (የልደት፣ የጋብቻ፣ የሞት ማስረጃዎች) እና የነዋሪዎች መታወቂያ አገልግሎት ማዕከል ሆኖ ያገለግላል።",
        },
        visitorInstructions: {
          om: "Galma seenuu dura lakkoofsa dabaree qabachuun wirtuu simannaa irratti gargaarsa gaafadhaa. Ragaaleen eenyummaa fi uunkaaleen barbaachisoo ta'an qophaa'uu isaanii mirkaneeffadhaa.",
          en: "Please obtain a queue ticket at the entrance and approach the central reception desk for guidance. Ensure all original identification documents and prerequisite forms are in hand.",
          am: "ወደ አዳራሹ ከመግባትዎ በፊት የመታወቂያ ቁጥር ወረቀት ይውሰዱ እና ወደ ማዕከላዊ መቀበያ ዴስክ ይቅረቡ። ሁሉም አስፈላጊ መታወቂያዎች እና የተሟሉ ቅጾች በእጅዎ መኖራቸውን ያረጋግጡ።",
        },
        image: "",
        services: [
          {
            name: {
              om: "Desikii Simannaafi Odeeffannoo",
              en: "Central Information & Reception Desk",
              am: "ዋና የመረጃ እና የመስተንግዶ ዴስክ",
            },
            description: {
              om: "Odeeffannoo tajaajila hundaa kennuu, dabaree qindeessuu fi qajeelfama kutaa tajaajilaa laachuu.",
              en: "Provides general public guidance, directory assistance, queue issuance, and preliminary document verification.",
              am: "አጠቃላይ የህዝብ መመሪያዎችን፣ የማውጫ ድጋፍን፣ የሰልፍ ወረቀቶችን እና ቅድመ ሰነድ ማረጋገጫን ይሰጣል።",
            },
            department: {
              om: "Waajjira Sab-qunnamtii fi Tajaajila Hawaasaa",
              en: "Public Communications & Citizen Service Desk",
              am: "የህዝብ ግንኙነት እና የዜጎች አገልግሎት ዴስክ",
            },
            roomNumber: "Counter 01 - 04",
            visitorInstructions: {
              om: "Duraan dursee desikii kanatti gargaarsa gaafadhaa.",
              en: "Approach this desk first upon entering the building for navigation.",
              am: "ወደ ህንፃው ሲገቡ ለመጀመሪያ ጊዜ ወደዚህ ዴስክ ይቅረቡ።",
            },
            icon: "Users",
            order: 1,
          },
          {
            name: {
              om: "Galmeessa Taateewwan Murteessoo fi Eenyummaa",
              en: "Vital Events Registration & National ID",
              am: "የወሳኝ ኩነቶች ምዝገባ እና የነዋሪዎች መታወቂያ",
            },
            description: {
              om: "Waraqaa ragaa dhalootaa, fuudhaa fi heerumaa, akkasumas waraqaa eenyummaa lammilee kennuufi haaressuu.",
              en: "Issuance of birth certificates, marriage licenses, death registrations, and official residency identification cards.",
              am: "የልደት፣ የጋብቻ እና የሞት ምዝገባ እንዲሁም የነዋሪነት መታወቂያ ካርዶችን መስጠት እና ማደስ።",
            },
            department: {
              om: "Damee Galmeessa Taateewwan Murteessoo",
              en: "Vital Events & Civil Status Registration Department",
              am: "የወሳኝ ኩነቶች እና የሲቪል ምዝገባ መምሪያ",
            },
            roomNumber: "Counter 05 - 10",
            visitorInstructions: {
              om: "Suuraawwan fi ragaa dhalootaa seera qabeessaa qabadhaa koottaa.",
              en: "Bring valid photo identification and required biometric verification documents.",
              am: "ትክክለኛ የፎቶ መታወቂያ እና አስፈላጊ የባዮሜትሪክ ሰነዶችን ይዘው ይምጡ።",
            },
            icon: "FileText",
            order: 2,
          },
        ],
      },
      {
        floorNumber: 2,
        order: 2,
        status: "published",
        name: {
          om: "Darbii 2ffaa",
          en: "Floor 2",
          am: "2ኛ ፎቅ",
        },
        title: {
          om: "Hayyama Daldalaa, Galii fi Tajaajila Faayinaansii",
          en: "Business Licensing, Revenue & Commercial Services",
          am: "የንግድ ፈቃድ፣ ገቢዎች እና የንግድ አገልግሎቶች",
        },
        description: {
          om: "Darbii lammaffaan tajaajiloota daldalaa, hayyama daldalaa haaraa fi haaressuu, kaffaltii gibiraa, akkasumas galmeessa dhaabbilee daldalaatiif kan qophaa'edha.",
          en: "Floor 2 is dedicated to business and commercial services, municipal operating trade permits, commercial registry, revenue assessment, and payment processing.",
          am: "ሁለተኛ ፎቅ ለንግድ እና ንግድ አገልግሎቶች፣ ለማዘጋጃ ቤት የንግድ ፈቃድ፣ ለንግድ ምዝገባ፣ ለግብር እና ለክፍያ ሂደት የተመደበ ነው።",
        },
        visitorInstructions: {
          om: "Uunkaa hayyama daldalaa xumurtanii fi ragaa kaffaltii gibiraa dhiyeeffachuu qabdu. Tajaajila sararaa (E-Service) fayyadamuunis ni danda'ama.",
          en: "Commercial applicants should present valid tax clearance, business registration copies, and trade license application documentation.",
          am: "የንግድ አመልካቾች ትክክለኛ የታክስ ክሊራንስ፣ የንግድ ምዝገባ ቅጂዎችን እና የንግድ ፈቃድ ማመልከቻ ሰነዶችን ማቅረብ አለባቸው።",
        },
        image: "",
        services: [
          {
            name: {
              om: "Tajaajila Hayyama Daldalaafi Misooma Gabaa",
              en: "Business & Trade Permit Processing",
              am: "የንግድ ፈቃድ እና የገበያ ልማት አገልግሎት",
            },
            description: {
              om: "Hayyama daldalaa haaraa baasuu, haaromsuu, jijjiirraa daldalaa fi ragaa seera qabeessummaa mirkaneessuu.",
              en: "Issuance and renewal of municipal business licenses, commercial name clearance, and sector compliance certificates.",
              am: "አዳዲስ የንግድ ፈቃዶችን ማውጣት፣ ማደስ፣ የንግድ ስም ማጣራት እና የዘርፍ ተገዢነት ማረጋገጫዎች።",
            },
            department: {
              om: "Waajjira Daldalaafi Misooma Gabaa",
              en: "Trade & Market Development Bureau",
              am: "የንግድ እና ገበያ ልማት ቢሮ",
            },
            roomNumber: "Office 201 - 206",
            visitorInstructions: {
              om: "Kaffaltii baankii dura ragaa herregaa dhiyeessaa.",
              en: "Payment receipts must be certified before final license printing.",
              am: "የመጨረሻው ፈቃድ ከመታተሙ በፊት የክፍያ ደረሰኞች መረጋገጥ አለባቸው።",
            },
            icon: "Briefcase",
            order: 1,
          },
          {
            name: {
              om: "Tajaajila Galiiwwanii fi Kaffaltii Gibiraa",
              en: "Revenue Collection & Tax Administration",
              am: "የገቢዎች አሰባሰብ እና የግብር አስተዳደር",
            },
            description: {
              om: "Gibira daldalaa, taaksii magaalaa, fi kaffaltii tajaajila adda addaa kaffalchiisuufi ragaa kennuu.",
              en: "Assessment and collection of local municipal taxes, commercial levies, property tax declarations, and clearance receipts.",
              am: "የአካባቢ ማዘጋጃ ቤት ታክስ ምዘና እና አሰባሰብ፣ የንግድ ክፍያዎች፣ የንብረት ታክስ መግለጫዎች እና የክሊራንስ ደረሰኞች።",
            },
            department: {
              om: "Waajjira Galiiwwan Magaalaa Burraayyuu",
              en: "Burayu Municipal Revenue Branch",
              am: "የቡራዩ ማዘጋጃ ቤት ገቢዎች ቅርንጫፍ",
            },
            roomNumber: "Counter 207 - 212",
            visitorInstructions: {
              om: "Lakk. TIN fi ragaa herregaa dhiyeeffadhaa.",
              en: "Have your TIN number and previous assessment slips ready.",
              am: "የቲን (TIN) ቁጥርዎን እና የቀድሞ የምዘና ወረቀቶችዎን ይዘው ይቅረቡ።",
            },
            icon: "Banknote",
            order: 2,
          },
        ],
      },
      {
        floorNumber: 3,
        order: 3,
        status: "published",
        name: {
          om: "Darbii 3ffaa",
          en: "Floor 3",
          am: "3ኛ ፎቅ",
        },
        title: {
          om: "Lafaafi Ijaarsa Magaalaa, Pilaanii fi Qabeenya Dhaabbataa",
          en: "Land Administration, Urban Planning & Construction Permitting",
          am: "የመሬት አስተዳደር፣ የከተማ ፕላን እና የግንባታ ፈቃድ",
        },
        description: {
          om: "Darbii sadaffaan tajaajila lafa magaalaa, mirkaneessa pilaanii ijaarsaa, heeyyama ijaarsaa, fi ragaa qabiyyee lafaa kennuuf kan hojjetudha.",
          en: "Floor 3 houses the technical departments overseeing urban land tenure, municipal building permits, architectural plan reviews, zoning inspections, and property documentation.",
          am: "ሶስተኛ ፎቅ የከተማ መሬት ይዞታን፣ የማዘጋጃ ቤት ግንባታ ፈቃዶችን፣ የህንፃ ፕላን ግምገማዎችን፣ የዞን ክፍፍል ቁጥጥርን እና የንብረት ሰነዶችን የሚመለከቱ ቴክኒካል ክፍሎችን ያካትታል።",
        },
        visitorInstructions: {
          om: "Pilaanii ijaarsaa seera qabeessaa fi waraqaa ragaa abbaa qabiyyummaa lafaa waliin dhiyaadhaa. Qorannoo teeknikaatiif beellama qabachuun ni danda'ama.",
          en: "Submit authorized architectural blue-prints, parcel registration documents, and cadastral survey certificates for review.",
          am: "የተፈቀዱ የህንፃ ፕላኖች፣ የቦታ ምዝገባ ሰነዶች እና የካዳስተር ሰርተፊኬቶችን ለግምገማ ያቅርቡ።",
        },
        image: "",
        services: [
          {
            name: {
              om: "Heeyyama Ijaarsa Magaalaa fi Mirkaneessa Pilaanii",
              en: "Building Construction Permits & Plan Approval",
              am: "የከተማ ግንባታ ፈቃድ እና የፕላን ማረጋገጫ",
            },
            description: {
              om: "Pilaanii ijaarsa manneen jireenyaa fi daldalaa qorachuu, heeyyama ijaarsaa kennuu fi to'annoo teeknikaa gaggeessuu.",
              en: "Evaluation of residential and commercial architectural designs, construction permit issuance, and civil engineering verifications.",
              am: "የመኖሪያ እና የንግድ አርክቴክቸር ዲዛይኖች ግምገማ፣ የግንባታ ፈቃድ አሰጣጥ እና የሲቪል ኢንጂነሪንግ ማረጋገጫዎች።",
            },
            department: {
              om: "Waajjira Pilaanii fi Ijaarsa Magaalaa",
              en: "Urban Planning & Construction Bureau",
              am: "የከተማ ፕላን እና ግንባታ ቢሮ",
            },
            roomNumber: "Office 301 - 308",
            visitorInstructions: {
              om: "Koopii waraqaa ragaa injinaroota eeyyama qabanii dhiyeeffadhaa.",
              en: "Architectural drawings must be stamped by licensed design consultants.",
              am: "የህንፃ ፕላን ስዕሎች ፈቃድ ባላቸው አማካሪዎች የተረጋገጡ መሆን አለባቸው።",
            },
            icon: "Building2",
            order: 1,
          },
          {
            name: {
              om: "Bulchiinsa Lafaa fi Galmeessa Ragaa Qabiyyee",
              en: "Land Holding Registration & Cadastre Administration",
              am: "የመሬት ይዞታ አስተዳደር እና የካዳስተር ምዝገባ",
            },
            description: {
              om: "Ragaa qabiyyee lafaa qulqulleessuu, walitti dhufeenya lafaa mirkaneessuu fi waraqaa ragaa lafaa kennuu.",
              en: "Land titling verifications, cadastral border demarcations, title transfer processing, and real property tenure certificates.",
              am: "የመሬት ይዞታ ማረጋገጫዎች፣ የካዳስተር ድንበር ክፍፍል፣ የባለቤትነት ዝውውር እና የቋሚ ንብረት ይዞታ ምስክር ወረቀቶች።",
            },
            department: {
              om: "Waajjira Bulchiinsa fi Qabeenya Lafaa",
              en: "Land Administration & Management Department",
              am: "የመሬት አስተዳደር እና ይዞታ መምሪያ",
            },
            roomNumber: "Office 309 - 315",
            visitorInstructions: {
              om: "Ragaalee abbaa qabiyyummaa duraanii orijinaalaan qabadhaa dhiyaadhaa.",
              en: "Bring original land holding titles and survey documents.",
              am: "ዋናውን የመሬት ይዞታ ሰነዶች እና የካርታ መረጃዎችን ይዘው ይቅረቡ።",
            },
            icon: "MapPinned",
            order: 2,
          },
        ],
      },
      {
        floorNumber: 4,
        order: 4,
        status: "published",
        name: {
          om: "Darbii 4ffaa",
          en: "Floor 4",
          am: "4ኛ ፎቅ",
        },
        title: {
          om: "Kutaa Hojii Gaggeessaa, Hoggansa fi Bulchiinsa Olaanaa",
          en: "Executive Administration, Mayor's Office & Branch Leadership",
          am: "የስራ አስፈፃሚ አስተዳደር፣ የከንቲባ ጽ/ቤት እና የቅርንጫፍ አመራር",
        },
        description: {
          om: "Darbii afraffaaniifi olaanaan kutaa hoggansa bulchiinsa Kutaa Magaalaa Burraayyuu, waajjira kantiibaa/bulchaa, qindeessaa damee MESOB, fi qulqullina tajaajila hawaasaa kan to'atudha.",
          en: "The top floor accommodates the senior municipal administration, Office of the Administrator/Branch Leadership, strategic governance, legal counsel, and citizen grievance oversight.",
          am: "የበላይ አራተኛ ፎቅ የቡራዩ ከተማ አስተዳደር ከፍተኛ አመራር፣ የአስተዳዳሪው ጽህፈት ቤት፣ የስትራቴጂክ አስተዳደር፣ የህግ አማካሪ እና የዜጎች ቅሬታ ሰሚ አካላትን ያካትታል።",
        },
        visitorInstructions: {
          om: "Hoggansa olaanaa qunnamuuf beellama duraan qabachuun dirqama. Giddugala simannaa darbii 1ffaa irraa beellama keessan mirkaneeffadhaa.",
          en: "Meetings with senior executive administrators require prior appointments. Inquiries and official petitions must be submitted through the administrative secretariat.",
          am: "ከከፍተኛ አመራሮች ጋር የሚደረጉ ስብሰባዎች ቅድመ ቀጠሮ ያስፈልጋቸዋል። ይፋዊ አቤቱታዎች በአስተዳደር ጽህፈት ቤቱ በኩል መቅረብ አለባቸው።",
        },
        image: "",
        services: [
          {
            name: {
              om: "Waajjira Bulchaa fi Hoggansa Olaanaa",
              en: "Office of the Branch Administrator & Executive Leadership",
              am: "የቅርንጫፍ አስተዳዳሪ ጽህፈት ቤት እና ከፍተኛ አመራር",
            },
            description: {
              om: "Hoggansa olaanaa, karoora tarsiimawaa magaalaa, fi to'annoo tajaajila hawaasummaa Kutaa Magaalaa Burraayyuu.",
              en: "Executive leadership, municipal strategy implementation, administrative supervision, and inter-agency coordination for Burayu MESOB.",
              am: "የስራ አስፈፃሚ አመራር፣ የማዘጋጃ ቤት ስትራቴጂ ትግበራ እና የቡራዩ መሶብ የቅርንጫፍ ቅንጅት።",
            },
            department: {
              om: "Waajjira Kantiibaa / Bulchaa Olaanaa",
              en: "Mayor & Central Administration Office",
              am: "የከንቲባ / ዋና አስተዳዳሪ ጽህፈት ቤት",
            },
            roomNumber: "Executive Suite 401 - 405",
            visitorInstructions: {
              om: "Beellama qofaaf banaadha.",
              en: "Open for scheduled public hearings, official delegations, and confirmed appointments.",
              am: "ለተያዙ ቀጠሮዎች፣ ይፋዊ ልዑካን እና የተረጋገጡ ስብሰባዎች ብቻ ክፍት ነው።",
            },
            icon: "Landmark",
            order: 1,
          },
          {
            name: {
              om: "Desikii Komii Hawaasaa fi Qulqullina Tajaajilaa",
              en: "Public Grievance Hearing & Service Quality Assurance",
              am: "የህዝብ ቅሬታ ሰሚ እና የአገልግሎት ጥራት ማረጋገጫ ዴስክ",
            },
            description: {
              om: "Komii tajaajila hawaasaa dhaggeeffachuu, qorachuu, fi furmaata saffisaa kennuuf hordoffii taasisuu.",
              en: "Review of citizen feedback, municipal appeals, public service quality audits, and transparent complaint resolutions.",
              am: "የዜጎች አስተያየት ግምገማ፣ የማዘጋጃ ቤት ይግባኞች፣ የአገልግሎት ጥራት ቁጥጥር እና ግልጽ የቅሬታ አፈታት።",
            },
            department: {
              om: "Hordoffii fi Qulqullina Tajaajila Hawaasaa",
              en: "Public Service Delivery & Ombudsman Unit",
              am: "የህዝብ አገልግሎት አሰጣጥ እና የቅሬታ ሰሚ ክፍል",
            },
            roomNumber: "Office 408 - 410",
            visitorInstructions: {
              om: "Iyyannoo keessan barreeffamaan dhiyeessuu ni dandeessu.",
              en: "Formal appeals should include previous counter reference tracking numbers.",
              am: "መደበኛ አቤቱታዎች የቀደመውን የመከታተያ መለያ ቁጥር ማካተት አለባቸው።",
            },
            icon: "ShieldCheck",
            order: 2,
          },
        ],
      },
    ];

    for (const fData of defaultFloors) {
      const { services, ...floorProps } = fData;
      const createdFloor = await Floor.create(floorProps);
      if (services && services.length > 0) {
        for (const sData of services) {
          await FloorService.create({ ...sData, floorId: createdFloor.id });
        }
      }
    }

    console.log("✅ 4-Floor directory initialized with default content.");
  } catch (err) {
    console.error("❌ Failed to initialize default floors:", err.message);
  }
};

module.exports = {
  getAll,
  getAllServices,
  getByNumber,
  getById,
  create,
  update,
  remove,
  addService,
  updateService,
  deleteService,
  reorderServices,
  ensureDefaultFloors,
};
