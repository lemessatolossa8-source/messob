const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { DEFAULT_SETTINGS } = require("../config/defaultSettings");

/**
 * Single-row site settings for the one-admin CMS.
 * id is always 1. Nested CMS fields live in `payload` (MySQL JSON).
 */
const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      defaultValue: 1,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: DEFAULT_SETTINGS,
    },
  },
  {
    tableName: "site_settings",
    timestamps: true,
  }
);

module.exports = Setting;
