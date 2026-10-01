const Setting = require("../models/Setting");

/**
 * Get all settings (admin only)
 */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll({
      order: [["category", "ASC"], ["key", "ASC"]],
    });

    // Transform to nested object structure
    const settingsObject = {};
    settings.forEach((setting) => {
      let value = setting.value;
      
      // Parse JSON values
      if (setting.type === "json" && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error(`Failed to parse JSON for setting ${setting.key}:`, e);
        }
      }
      
      // Parse boolean values
      if (setting.type === "boolean") {
        value = value === "true" || value === true;
      }
      
      // Parse number values
      if (setting.type === "number" && value) {
        value = parseFloat(value);
      }

      // Create nested structure based on key (e.g., "siteName.en" -> {siteName: {en: value}})
      const keys = setting.key.split(".");
      let current = settingsObject;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    });

    res.json({
      success: true,
      data: settingsObject,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

/**
 * Get public settings (accessible without auth)
 */
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll({
      where: { isPublic: true },
    });

    const settingsObject = {};
    settings.forEach((setting) => {
      let value = setting.value;
      
      if (setting.type === "json" && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error(`Failed to parse JSON for setting ${setting.key}:`, e);
        }
      }
      
      if (setting.type === "boolean") {
        value = value === "true" || value === true;
      }
      
      if (setting.type === "number" && value) {
        value = parseFloat(value);
      }

      const keys = setting.key.split(".");
      let current = settingsObject;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    });

    res.json({
      success: true,
      data: settingsObject,
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public settings",
      error: error.message,
    });
  }
};

/**
 * Update multiple settings at once
 */
exports.updateSettings = async (req, res) => {
  try {
    const settingsData = req.body;

    // Flatten nested object to key-value pairs
    const flattenObject = (obj, prefix = "") => {
      const flattened = [];
      
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          flattened.push(...flattenObject(value, fullKey));
        } else {
          flattened.push({ key: fullKey, value });
        }
      }
      
      return flattened;
    };

    const flatSettings = flattenObject(settingsData);

    // Update or create each setting
    for (const { key, value } of flatSettings) {
      let type = "string";
      let storedValue = value;

      // Determine type and format value
      if (typeof value === "boolean") {
        type = "boolean";
        storedValue = value.toString();
      } else if (typeof value === "number") {
        type = "number";
        storedValue = value.toString();
      } else if (typeof value === "object") {
        type = "json";
        storedValue = JSON.stringify(value);
      }

      // Determine category from key prefix
      let category = "general";
      if (key.startsWith("contactInfo")) category = "contact";
      else if (key.startsWith("socialMedia")) category = "social";
      else if (key.startsWith("languageSettings")) category = "language";
      else if (key.startsWith("contentSettings")) category = "content";
      else if (key.startsWith("seo")) category = "seo";
      else if (key.startsWith("eService")) category = "eservice";

      // Determine if public (visible to frontend without auth)
      const isPublic = [
        "siteName",
        "siteTagline",
        "siteDescription",
        "contactInfo",
        "socialMedia",
        "languageSettings.defaultLanguage",
        "eService",
        "seo",
      ].some((prefix) => key.startsWith(prefix));

      await Setting.upsert({
        key,
        value: storedValue,
        type,
        category,
        isPublic,
      });
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

/**
 * Get a single setting by key
 */
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    let value = setting.value;
    if (setting.type === "json" && value) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.error(`Failed to parse JSON for setting ${key}:`, e);
      }
    }
    
    if (setting.type === "boolean") {
      value = value === "true" || value === true;
    }
    
    if (setting.type === "number" && value) {
      value = parseFloat(value);
    }

    res.json({
      success: true,
      data: {
        key: setting.key,
        value,
        type: setting.type,
        category: setting.category,
        description: setting.description,
      },
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch setting",
      error: error.message,
    });
  }
};

/**
 * Delete a setting
 */
exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const deleted = await Setting.destroy({ where: { key } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    res.json({
      success: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete setting",
      error: error.message,
    });
  }
};

/**
 * Reset settings to defaults
 */
exports.resetSettings = async (req, res) => {
  try {
    // Delete all non-critical settings
    await Setting.destroy({
      where: {
        category: {
          [require("sequelize").Op.in]: ["general", "contact", "social", "language", "content", "seo"],
        },
      },
    });

    res.json({
      success: true,
      message: "Settings reset to defaults successfully",
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset settings",
      error: error.message,
    });
  }
};
