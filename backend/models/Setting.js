const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Unique setting key (e.g., 'site_name', 'contact_email')",
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Setting value (can be JSON string for complex data)",
    },
    type: {
      type: DataTypes.ENUM("string", "json", "boolean", "number"),
      defaultValue: "string",
      comment: "Data type of the value",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "general",
      comment: "Setting category (general, contact, social, language, content, seo)",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Human-readable description of the setting",
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this setting is accessible to public API",
    },
  },
  {
    tableName: "settings",
    timestamps: true,
  }
);

module.exports = Setting;
