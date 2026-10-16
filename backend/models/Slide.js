const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Slide = sequelize.define(
  "Slide",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING(2000),
      allowNull: false,
      defaultValue: "",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      defaultValue: "published",
    },
  },
  {
    tableName: "slides",
    timestamps: true,
  }
);

Slide.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = Slide;
