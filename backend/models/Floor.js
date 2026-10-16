const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Floor = sequelize.define(
  "Floor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    floorNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        min: 1,
        max: 20,
      },
    },
    name: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { en: "", am: "", om: "" },
    },
    title: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    description: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    visitorInstructions: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    image: {
      type: DataTypes.STRING(2000),
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      defaultValue: "published",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
    tableName: "Floors",
  }
);

Floor.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = Floor;
