const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { en: "", am: "", om: "" },
    },
    description: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "General",
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      defaultValue: "published",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

Service.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = Service;
