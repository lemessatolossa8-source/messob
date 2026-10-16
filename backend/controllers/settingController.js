const Setting = require("../models/Setting");
const {
  DEFAULT_SETTINGS,
  deepMergeKnown,
  stripSecrets,
  validateSettingsPayload,
  toPublicSettings,
} = require("../config/defaultSettings");

const SINGLETON_ID = 1;

async function getOrCreateRecord() {
  let record = await Setting.findByPk(SINGLETON_ID);
  if (!record) {
    record = await Setting.create({
      id: SINGLETON_ID,
      payload: DEFAULT_SETTINGS,
    });
  }
  return record;
}

function resolvedPayload(record) {
  return deepMergeKnown(DEFAULT_SETTINGS, record?.payload || {});
}

/**
 * GET /api/settings — full settings (admin only)
 */
exports.getAllSettings = async (req, res) => {
  try {
    const record = await getOrCreateRecord();
    const data = resolvedPayload(record);
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

/**
 * GET /api/settings/public — public fields (no auth)
 */
exports.getPublicSettings = async (req, res) => {
  try {
    const record = await getOrCreateRecord();
    const data = toPublicSettings(resolvedPayload(record));
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public settings",
    });
  }
};

/**
 * PUT /api/settings — create/update the single site_settings row (admin only)
 */
exports.updateSettings = async (req, res) => {
  try {
    const incoming = stripSecrets(req.body || {});
    const record = await getOrCreateRecord();
    const merged = deepMergeKnown(resolvedPayload(record), incoming);
    const errors = validateSettingsPayload(merged);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    record.payload = merged;
    record.changed("payload", true);
    await record.save();

    const saved = resolvedPayload(record);
    res.json({
      success: true,
      message: "Settings updated successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

/**
 * POST /api/settings/reset — restore defaults (admin only)
 */
exports.resetSettings = async (req, res) => {
  try {
    const record = await getOrCreateRecord();
    record.payload = DEFAULT_SETTINGS;
    record.changed("payload", true);
    await record.save();

    res.json({
      success: true,
      message: "Settings reset to defaults successfully",
      data: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset settings",
    });
  }
};
