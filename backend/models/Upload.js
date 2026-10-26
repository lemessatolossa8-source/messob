const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Upload = sequelize.define(
  "Upload",
  {
    filename: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "image/jpeg",
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    data: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
    },
  },
  {
    tableName: "uploads",
    timestamps: true,
  }
);

module.exports = Upload;
